---
paths:
  - "brain/**"
  - "AGENTS.md"
---

# Brain files (auto-loaded only when these paths are touched)

- Header `> **Load when:** …` in the first lines; budgets: AGENTS ≤ 60, BRAIN ≤ 60, STATE ≤ 150, others ≤ 200 (CTX-6).
- Keep `AGENTS.md` edits rare — every change invalidates the prompt cache for all sessions.
- Facts in tables/one-liners; one fact, one home; cite IDs, don't restate rules.
- Bump `Last verified` when you confirm a file against code. Run `bash .claude/hooks/brain-check.sh`.
- Details: `brain/09-knowledge-maintenance/documentation-rules.md`.
