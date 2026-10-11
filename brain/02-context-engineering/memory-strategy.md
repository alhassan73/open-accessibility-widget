# Memory Strategy

> **Load when:** deciding where to record something, or at session start/end.

What persists between sessions, where, and who maintains it. Agents forget everything when a
session ends; the repo does not.

---

## 1. Memory layers

| Layer | Medium | Lifetime | Holds | Maintained by |
| --- | --- | --- | --- | --- |
| Router | `AGENTS.md` | Project | Entry rules, gates summary | Human + agent (rarely) |
| Working memory | `STATE.md` | Rolling | Phase, goal, in-progress, open questions, handoff | Agent, every meaningful change |
| Long-term knowledge | `06-…`, `07-…` | Project | What the system is and why | Agent, same change as the code |
| Rules | `04-…`, `10-…` | Project | How code must be | Human-approved changes only |
| History | `09-knowledge-maintenance/changelog.md`, git | Permanent | What changed, when | Agent at completion |
| Agent-local memory | e.g. Claude auto-memory, Cursor memories | Per user/tool | Personal preferences only | The tool |

**Repo memory wins.** Anything another person or agent needs belongs in the repo, not in a
tool-local memory. Tool-local memory never holds project facts that contradict the brain.

## 2. What to write where

| You learned… | Write it to |
| --- | --- |
| A task is half done / a hypothesis is being tested | `STATE.md` §In progress / §Session handoff |
| An unknown that blocks or shapes work | `STATE.md` §Open questions + `**Open question:**` in the relevant file |
| How a module actually works (was undocumented) | `06-project-knowledge/system-architecture.md` or the feature folder |
| A rule the business imposes | `06-project-knowledge/business-rules.md` as `BR-###` |
| A choice between alternatives with lasting effect | `06-project-knowledge/decisions/ADR-####-<slug>.md` |
| A bug you can't fix now / a trap | `STATE.md` §Open questions or the feature's `testing.md` known issues |
| A new convention | `04-harness-engineering/coding/coding-conventions.md` (approval) |
| What shipped | `09-knowledge-maintenance/changelog.md` |

## 3. Do not store

- Secrets, tokens, personal data, production records.
- Things the code or git already records verbatim (function lists, commit logs).
- Conversation-only context ("the user said they're tired").
- Speculation without the `Assumption` / `Open question` marker.

## 4. Session protocol

- **Start:** the SessionStart notice summarizes `STATE.md`. Read the file only when continuing
  in-progress work; trust its handoff note but verify file state before editing.
- **During:** update `STATE.md` when a unit completes or the plan changes.
- **End / before context reset:** overwrite §Session handoff; move items > ~10 from §Recently
  completed to the changelog.
