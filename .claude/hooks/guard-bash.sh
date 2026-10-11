#!/usr/bin/env bash
# PreToolUse guard for the Bash tool. Reads the hook JSON on stdin and denies or asks on risky
# commands. Rules: brain/04-harness-engineering/tools/safety-guardrails.md
# Each entry is "<extended regex, case-insensitive>::<reason shown to the agent>".
# Add project patterns to EXTRA_DENY / EXTRA_ASK; never weaken the defaults without approval.

EXTRA_DENY=(
)
EXTRA_ASK=(
  'npm[[:space:]]+version::npm version bumps package.json and creates a release tag. Confirm with the user (approval-workflow.md).'
  'git[[:space:]]+tag[[:space:]]+(-[a-z]+[[:space:]]+)*v[0-9]::A pushed v* tag publishes to npm (release.yml). Confirm with the user.'
  'gh[[:space:]]+(release[[:space:]]+(create|delete|edit|upload)|workflow[[:space:]]+run)::GitHub release / workflow dispatch (deploy or publish). Confirm with the user.'
)

DENY=(
  'git[[:space:]]+push.*(--force($|[^-])|[[:space:]]-[a-z]*f([[:space:]]|$))::Force-push is blocked (TOOL-3). Ask the user; --force-with-lease only with explicit approval.'
  '--no-verify|--no-gpg-sign|core\.hooksPath::Bypassing hooks or signing is blocked (TOOL-3, ENF-2).'
  'rm[[:space:]]+-[a-z]*r[a-z]*[[:space:]]+(-[a-z]+[[:space:]]+)*(/|~|\$HOME|\.|\.\.|\*)/?\*?([[:space:]]|$)::Recursive delete of a root, home, or current directory is blocked (TOOL-3).'
  '(curl|wget)[^|]*\|[[:space:]]*(sudo[[:space:]]+)?(ba|z)?sh::Piping a download into a shell is blocked.'
  '(^|[^a-z0-9_.-])\.env(\.(local|development|dev|test|staging|production|prod)(\.local)?)?([^a-z0-9_.-]|$)::Secret env files are off-limits (CTX-4). Reference variables by name; use .env.example.'
  '(cat|less|more|head|tail|type|bat|grep|cp|scp)[^|;&]*(\.pem|\.key|id_rsa|id_ed25519)::Reading key material is blocked (CTX-4).'
  'git[[:space:]]+filter-(branch|repo)|git[[:space:]]+push[^|;&]*[[:space:]]:[a-z]::History rewrite / remote branch deletion is blocked (TOOL-3).'
)

ASK=(
  'git[[:space:]]+reset[[:space:]]+--hard::git reset --hard discards work. Confirm with the user (recovery-workflow.md).'
  'git[[:space:]]+clean[[:space:]]+-[a-z]*f::git clean deletes untracked files. Confirm with the user.'
  'git[[:space:]]+(checkout|restore)[[:space:]]+(--[[:space:]]+)?\.([[:space:]]|$)::Discarding all working-tree changes. Confirm with the user.'
  'git[[:space:]]+branch[[:space:]]+-D::Force-deleting a branch. Confirm with the user.'
  '(drop|truncate)[[:space:]]+(table|database|schema)::Destructive SQL. Confirm with the user (TOOL-4).'
  '(prisma[[:space:]]+migrate[[:space:]]+(deploy|reset)|migrate[[:space:]]+(reset|fresh)|db[[:space:]]+(reset|drop))::Database migration/reset. Confirm with the user and state the rollback.'
  '(terraform|tofu)[[:space:]]+(apply|destroy)|kubectl[[:space:]]+(apply|delete|scale)|helm[[:space:]]+(install|upgrade|uninstall)::Infrastructure change (TOOL-4). Confirm with the user.'
  'vercel[^|;&]*--prod|netlify[[:space:]]+deploy[^|;&]*--prod|fly[[:space:]]+deploy|firebase[[:space:]]+deploy|serverless[[:space:]]+deploy|gcloud[^|;&]*deploy::Deploy (TOOL-4). Confirm with the user.'
  '(npm|pnpm|yarn)[[:space:]]+publish|docker[[:space:]]+push|twine[[:space:]]+upload|cargo[[:space:]]+publish::Publishing an artifact (TOOL-4). Confirm with the user.'
)

input=$(cat)
if command -v jq >/dev/null 2>&1; then
  cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  cmd=$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(\([^"\\]\|\\.\)*\)".*/\1/p')
fi
[ -z "$cmd" ] && cmd=$input

decide() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"%s","permissionDecisionReason":"%s"}}\n' "$1" "$2"
  exit 0
}

check() {
  local decision=$1; shift
  local entry re reason
  for entry in "$@"; do
    re=${entry%%::*}
    reason=${entry#*::}
    if printf '%s' "$cmd" | grep -Eiq -- "$re"; then
      decide "$decision" "$reason"
    fi
  done
}

check deny "${DENY[@]}" "${EXTRA_DENY[@]}"
check ask "${ASK[@]}" "${EXTRA_ASK[@]}"
exit 0
