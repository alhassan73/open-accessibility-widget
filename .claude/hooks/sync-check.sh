#!/usr/bin/env bash
# Stop hook: when a turn leaves code changes, ask the agent for a TARGETED brain sync — once per
# distinct change set. Silent (zero tokens) when no code changed or this change set was already handled.
# Policy: brain/09-knowledge-maintenance/synchronization-policy.md

input=$(cat)
# Never re-block while the agent is already continuing because of this hook.
case "$input" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;; esac

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
[ -d brain ] || exit 0

# Code = everything changed except the brain and the harness itself.
EXCLUDE=(':(exclude)brain' ':(exclude)AGENTS.md' ':(exclude)CLAUDE.md' ':(exclude).claude')
code=$(git status --porcelain -uall -- . "${EXCLUDE[@]}" 2>/dev/null | cut -c4- | sed 's/.* -> //')
[ -z "$code" ] && exit 0

# Fingerprint the code changes only, so the agent's brain edits don't re-trigger the hook.
stamp=$( { git diff -- . "${EXCLUDE[@]}"; git diff --cached -- . "${EXCLUDE[@]}"; printf '%s\n' "$code"; } 2>/dev/null | cksum)
stamp_file="$(git rev-parse --git-dir)/brain-sync-stamp"
[ -f "$stamp_file" ] && [ "$(cat "$stamp_file")" = "$stamp" ] && exit 0
printf '%s' "$stamp" > "$stamp_file"

count=$(printf '%s\n' "$code" | wc -l | tr -d ' ')
files=$(printf '%s\n' "$code" | head -n 10 | tr '\n' ',' | sed 's/,$//; s/,/, /g; s/"/\\"/g')
[ "$count" -gt 10 ] && files="$files, … (+$((count - 10)) more)"

reason="Brain sync check — code changed ($count files: $files). Before finishing: 1) update brain/STATE.md (in progress / recently completed / handoff); 2) apply the trigger table in brain/09-knowledge-maintenance/synchronization-policy.md §1 to THESE changes only and edit just the affected brain files — no full sweep, don't re-read unaffected files; 3) if no brain file is affected, reply 'Brain: no impact' in one line."

printf '{"decision":"block","reason":"%s"}\n' "$reason"
exit 0
