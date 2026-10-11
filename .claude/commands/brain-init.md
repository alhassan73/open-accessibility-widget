---
description: Initialize the project brain from this repository (fills placeholder slots, lists open questions)
argument-hint: "[optional notes about the project]"
---

Initialize the project brain. User notes: $ARGUMENTS

**Location check first.** The brain belongs in the repository's MAIN working-tree root:
`git rev-parse --path-format=absolute --git-common-dir` → its parent directory (or the first entry
of `git worktree list`). If `git rev-parse --show-toplevel` differs from that root, you are in a
linked worktree (e.g. `.claude/worktrees/…`): **stop**, tell the user the main root path, and do not
fill or copy anything here. Never install into a linked worktree or under `.claude/worktrees/`.
Installing the files: `sh <template>/install.sh <main-root>` (`brain/README.md` §3).

Follow `brain/05-graph-engineering/workflow-design.md` §4 Bootstrap exactly.

- Delegate the repository scan to the `context-scout` subagent; ask it for facts per brain file, not file dumps.
- Fill only what the scan verifies. Everything else → `**Open question:**` (mirrored in `STATE.md`) or
  `Not applicable — <reason>`. Never invent.
- A gate the project doesn't have (often lint or format) is written `none` / `n/a — <reason>` — never
  invent a command; adjust gate wording that assumes it.
- Never read secret files. Use `.env.example` for variable names.
- Finish with `bash .claude/hooks/brain-check.sh`, then report per
  `brain/01-prompt-engineering/output-contracts.md`: files filled, open questions as one batch
  with recommended defaults.
