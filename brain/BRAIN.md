# Project Brain — Router

> Find your task's row, read only those files, header first. Rules: `04-harness-engineering/README.md`
> (cite IDs). Small tasks don't come here — see the fast path in `AGENTS.md`.

| Task | Read (paths under `brain/`) |
| --- | --- |
| First Medium/Large edit this session | `02-context-engineering/project-context.md`, `04-harness-engineering/README.md` |
| New feature | `05-graph-engineering/feature-workflow.md`, `07-feature-documentation/feature-registry.md` → the feature folder |
| Bug | `05-graph-engineering/bugfix-workflow.md`, `03-loop-engineering/debugging-loop.md` |
| Refactor | `05-graph-engineering/refactoring-workflow.md`, `04-harness-engineering/coding/refactoring-rules.md` |
| New module / cross-module / structure | `06-project-knowledge/system-architecture.md`, `04-harness-engineering/architecture/`, `09-knowledge-maintenance/change-impact-analysis.md` |
| Writing code (unsure of a convention) | `04-harness-engineering/coding/` — the one file that matches |
| UI | `04-harness-engineering/design/component-design.md`, `10-project-standards/frontend-standards.md`, `accessibility.md` |
| State, caching, data movement | `04-harness-engineering/design/state-management.md` |
| Failure paths, logging | `04-harness-engineering/design/error-handling.md` |
| Domain logic | `06-project-knowledge/business-rules.md`, `domain-model.md`, `glossary.md` |
| External services | `06-project-knowledge/integrations.md` |
| Auth, secrets, input, data access | `06-project-knowledge/security-model.md`, `08-quality-and-evaluation/security-checklist.md` |
| Dependencies | `04-harness-engineering/tools/dependency-management.md` (approval gate) |
| Commands, environments | `04-harness-engineering/tools/execution-environment.md`, `tool-permissions.md` |
| Tests | `03-loop-engineering/testing-loop.md`, `08-quality-and-evaluation/testing-strategy.md` |
| A gate fails / things broke | `05-graph-engineering/recovery-workflow.md` |
| Blocked, unsure whether to stop | `03-loop-engineering/stopping-conditions.md`, `retry-strategy.md` |
| Why is it like this? | `06-project-knowledge/decisions/` |
| Two sources disagree | `02-context-engineering/source-of-truth.md` |
| What / how much to load | `02-context-engineering/context-policy.md` |
| Finishing Medium/Large | `08-quality-and-evaluation/definition-of-done.md`, `09-knowledge-maintenance/synchronization-policy.md` |
| Writing or editing brain files | `09-knowledge-maintenance/documentation-rules.md` |

**Loop:** Classify → retrieve → plan (M/L) → [approval] → implement in green increments → gates →
review → sync brain + `STATE.md` → report. Routing detail: `05-graph-engineering/workflow-design.md`.

**Precedence:** user's explicit instruction > `AGENTS.md` > approval gates & guardrails > rulebook >
`10-project-standards/` > other brain files > agent defaults. Code = what *is*; brain = what *should
be* and *why*.
