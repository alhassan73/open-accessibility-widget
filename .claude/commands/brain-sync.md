---
description: Detect and fix drift between the code and the project brain
argument-hint: "[area | since <commit/date>]"
---

Scope: $ARGUMENTS

Follow `brain/09-knowledge-maintenance/synchronization-policy.md` §3. Start with
`bash .claude/hooks/brain-check.sh`. Delegate wide comparisons to `context-scout`. Fix drift, bump
`Last verified`, and report every brain file changed with what was wrong.
