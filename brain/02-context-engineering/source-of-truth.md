# Source of Truth

> **Load when:** two sources disagree.

Every fact has exactly one canonical home. Everything else links to it. Duplicated facts drift.

---

## 1. Truth by question

| Question | Truth | Not truth |
| --- | --- | --- |
| What does the code do right now? | The code (+ running it) | Docs, comments, memory |
| What should it do? | Feature folder requirements, business rules, accepted spec | The current code (may be buggy) |
| Why is it this way? | `06-project-knowledge/decisions/`, git history | Guesses |
| How must code be written? | `04-harness-engineering/`, `10-project-standards/`, lint/type config | Agent defaults, other projects |
| What is the agent allowed to do? | `AGENTS.md`, `approval-workflow.md`, `safety-guardrails.md`, `.claude/settings.json` | Implicit permission |
| What is in progress? | `STATE.md` | Chat history |
| What versions/APIs exist? | Lockfile + installed package docs | Training data |

## 2. Conflict resolution

- **Code ≠ knowledge doc** (doc describes what *is*): the code wins; fix the doc in the same change
  and report "doc was wrong: …".
- **Code ≠ requirement / business rule** (what *should be*): this is a **bug or an unrecorded
  decision**. Do not silently "fix" either side. Report it; ask which is right unless the task is
  exactly that fix.
- **Brain file ≠ brain file**: precedence decides — user's explicit instruction > `AGENTS.md` >
  approval gates & guardrails > rulebook > `10-project-standards/` > other brain files > agent
  defaults. Fix the loser.
- **Brain ≠ user instruction**: follow the user for this task, state the conflict, propose the brain
  update — except approval gates and guardrails, which require explicit approval.
- **Training data ≠ installed version**: the installed version wins. Read its docs/types before
  using an API you "remember".

## 3. Single-home rules

- State a fact once; elsewhere write a pointer (`see system-architecture.md §3`).
- Summaries (e.g. `AGENTS.md` snapshot) are allowed only for facts that rarely change, and
  `/brain-sync` checks them.
- Comments in code explain *why* locally; system-level *why* goes to an ADR.
