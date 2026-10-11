#!/usr/bin/env bash
# Project-brain health check.
#   bash .claude/hooks/brain-check.sh            full report; exit 1 if any issue (usable in CI)
#   bash .claude/hooks/brain-check.sh --session  compact notice for the SessionStart hook; always exit 0
# Checks: unfilled {{SLOTS}}, size budgets (CTX-6), missing "Load when" headers (CTX-2),
# stale "Last verified" dates. Policy: brain/09-knowledge-maintenance/synchronization-policy.md

STALE_DAYS=${BRAIN_STALE_DAYS:-90}
root=${CLAUDE_PROJECT_DIR:-$(pwd)}
cd "$root" 2>/dev/null || exit 0
[ -d brain ] || exit 0
mode=${1:-full}

issues=()
add() { issues+=("$1"); }

# 1. Unfilled init slots (double-brace UPPER_SNAKE). Copy-me templates use <angle> fields instead.
slot_files=$(grep -rlE '\{\{[A-Z0-9_]+\}\}' AGENTS.md brain .claude/rules 2>/dev/null)
if [ -n "$slot_files" ]; then
  n=$(grep -rhoE '\{\{[A-Z0-9_]+\}\}' AGENTS.md brain .claude/rules 2>/dev/null | wc -l | tr -d ' ')
  f=$(printf '%s\n' "$slot_files" | wc -l | tr -d ' ')
  add "unfilled: $n slots in $f files — run /brain-init"
  slot_list=$slot_files
fi

# 2. Size budgets (CTX-6)
budget() { # file max
  [ -f "$1" ] || return
  local lines; lines=$(wc -l < "$1" | tr -d ' ')
  [ "$lines" -gt "$2" ] && add "over budget: $1 ($lines > $2 lines)"
}
budget AGENTS.md 60
budget brain/BRAIN.md 60
budget brain/STATE.md 150
while IFS= read -r f; do
  # README is the human guide — agents never load it, so it has no budget.
  case "$f" in brain/BRAIN.md|brain/STATE.md|brain/README.md) continue ;; esac
  budget "$f" 200
done < <(find brain -name '*.md' -type f)

# 3. Missing "Load when" header (CTX-2) — skips tier-0, human README, and copy-me templates
while IFS= read -r f; do
  case "$f" in
    brain/BRAIN.md|brain/STATE.md|brain/README.md) continue ;;
    */features/*|*/decisions/*) continue ;;
  esac
  head -n 6 "$f" | grep -q 'Load when' || add "no 'Load when' header: $f"
done < <(find brain -name '*.md' -type f)

# 4. Stale "Last verified" dates
to_epoch() { date -d "$1" +%s 2>/dev/null || date -j -f %Y-%m-%d "$1" +%s 2>/dev/null; }
now=$(date +%s)
while IFS= read -r line; do
  f=${line%%:*}
  d=$(printf '%s' "$line" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -n1)
  [ -z "$d" ] && continue
  e=$(to_epoch "$d") || continue
  [ -z "$e" ] && continue
  age=$(( (now - e) / 86400 ))
  [ "$age" -gt "$STALE_DAYS" ] && add "stale: $f (verified $d, ${age}d ago)"
done < <(grep -rE 'Last (verified|updated):?\**:? *[0-9]{4}-[0-9]{2}-[0-9]{2}' brain 2>/dev/null)

# Output
if [ "$mode" = --session ]; then
  for i in "${issues[@]}"; do printf '[brain] %s\n' "$i"; done
  s=brain/STATE.md
  if [ -f "$s" ]; then
    # Lines of a "## <heading>" section, minus blanks and HTML comments.
    section() { awk -v h="$1" 'index($0, "## " h) == 1 {f=1; next} /^## /{f=0} f && NF && !/^<!--/' "$s"; }
    upd=$(grep -m1 -oE 'Last updated:\** *[^ ]+' "$s" | sed 's/.*: *//; s/\*//g')
    goal=$(section 'Current goal' | head -n1 | sed 's/ *<!--.*//')
    prog=$(section 'In progress' | grep -E '^- \[ \]' | head -n3 | sed 's/^- \[ \] *//' | tr '\n' ';' | sed 's/;$//; s/;/; /g')
    oq=$(section 'Open questions' | grep -cE '^- ')
    printf '[brain] STATE %s · goal: %s\n' "${upd:-?}" "${goal:-?}"
    [ -n "$prog" ] && printf '[brain] in progress: %s — read brain/STATE.md only if continuing it\n' "$prog"
    [ "${oq:-0}" -gt 0 ] && printf '[brain] open questions: %s (brain/STATE.md)\n' "$oq"
  fi
  exit 0
fi

if [ ${#issues[@]} -eq 0 ]; then
  echo "brain-check: OK"
  exit 0
fi
echo "brain-check: ${#issues[@]} issue(s)"
for i in "${issues[@]}"; do printf '  - %s\n' "$i"; done
[ -n "${slot_list:-}" ] && printf '%s\n' "$slot_list" | sed 's/^/      /'
exit 1
