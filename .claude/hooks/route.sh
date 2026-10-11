#!/usr/bin/env bash
# UserPromptSubmit hook: adds ONE line naming the brain files that fit the prompt, so the agent
# reads them directly instead of the router table. Prints nothing when no route matches.
# Tune ROUTES per project: "<extended regex of whole words, case-insensitive>::<files under brain/>".
# Patterns are matched as whole words; spell out stems explicitly (e.g. creat[a-z]*).

ROUTES=(
  'bugs?|fix(es|ed|ing)?|broken|crash(es|ed|ing)?|errors?|exceptions?|fails?|failing|failed|regressions?|not working::05-graph-engineering/bugfix-workflow.md, 03-loop-engineering/debugging-loop.md'
  'refactor[a-z]*|clean ?up|restructur[a-z]*|renam[a-z]*|extract[a-z]*::05-graph-engineering/refactoring-workflow.md, 04-harness-engineering/coding/refactoring-rules.md'
  'features?|add(s|ed|ing)?|implement[a-z]*|build(s|ing)?|creat[a-z]*|new (page|screen|endpoint|module|component)::05-graph-engineering/feature-workflow.md, 07-feature-documentation/feature-registry.md'
  'review[a-z]*|audit[a-z]*::03-loop-engineering/review-loop.md, 08-quality-and-evaluation/definition-of-done.md'
  'tests?|testing|specs?|coverage|e2e::03-loop-engineering/testing-loop.md'
  'auth[a-z]*|log ?in|log ?out|sign ?(in|up)|permissions?|roles?|passwords?|tokens?|sessions?|secrets?::06-project-knowledge/security-model.md, 08-quality-and-evaluation/security-checklist.md'
  'components?|ui|screens?|layouts?|styl[a-z]*|css|tailwind|buttons?|modals?|forms?|responsive::04-harness-engineering/design/component-design.md, 10-project-standards/frontend-standards.md'
  'state|stores?|cach[a-z]*|fetch[a-z]*|quer(y|ies)|revalidat[a-z]*::04-harness-engineering/design/state-management.md'
  'apis?|exports?|options?|props?|types?|breaking|semver|public::10-project-standards/compatibility.md, 05-graph-engineering/approval-workflow.md'
  'settings|storage|localstorage|profiles?|presets?|schemas?|migrations?::06-project-knowledge/domain-model.md'
  'rtl|arabic|labels?|translat[a-z]*|i18n|languages?::04-harness-engineering/design/component-design.md'
  'dependenc(y|ies)|packages?|install[a-z]*|upgrad[a-z]*|npm|pnpm|yarn|librar(y|ies)::04-harness-engineering/tools/dependency-management.md (approval gate)'
  'deploy[a-z]*|releas[a-z]*|publish[a-z]*|production|prod::05-graph-engineering/approval-workflow.md'
  'slow|performance|perf|optimi[sz][a-z]*|bundle|lighthouse::10-project-standards/performance.md'
  'a11y|accessib[a-z]*|screen readers?|keyboard|contrast::10-project-standards/accessibility.md'
)
MAX=3

input=$(cat)
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" 2>/dev/null || exit 0
[ -d brain ] || exit 0

if command -v jq >/dev/null 2>&1; then
  prompt=$(printf '%s' "$input" | jq -r '.prompt // empty' 2>/dev/null)
else
  prompt=$(printf '%s' "$input" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(\([^"\\]\|\\.\)*\)".*/\1/p')
fi
[ -z "$prompt" ] && exit 0
# Slash commands route themselves.
case "$prompt" in /*) exit 0 ;; esac

hits=()
for entry in "${ROUTES[@]}"; do
  re=${entry%%::*}
  if printf '%s' "$prompt" | grep -Eiq -- "(^|[^a-z])($re)([^a-z]|$)"; then
    hits+=("${entry#*::}")
    [ ${#hits[@]} -ge $MAX ] && break
  fi
done
[ ${#hits[@]} -eq 0 ] && exit 0

out=""
for h in "${hits[@]}"; do out="${out:+$out | }$h"; done
printf '[route] Small task → fast path, read nothing. Otherwise read only (under brain/): %s\n' "$out"
exit 0
