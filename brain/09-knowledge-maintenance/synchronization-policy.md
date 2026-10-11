# Synchronization Policy

> **Load when:** finishing a change (sync step), or running `/brain-sync`. Keeps the brain true.

## 1. Sync triggers — change → file

| When the change… | Update |
| --- | --- |
| Adds/removes/renames a feature, page, or endpoint | Feature folder, `feature-registry.md`, `product-overview.md` §Feature map |
| Adds a module, folder, layer, or changes ownership | `module-boundaries.md`, `system-architecture.md` |
| Changes allowed imports | `dependency-rules.md` |
| Introduces a reusable helper or pattern | `code-patterns.md` / `architectural-patterns.md` |
| Adds/changes a business rule | `business-rules.md` (`BR-###`) |
| Adds/changes an entity, field, or lifecycle | `domain-model.md` |
| Adds/changes an external service | `integrations.md` |
| Touches auth, roles, data classes | `security-model.md` |
| Adds a dependency, env var, command | `project-context.md`, `execution-environment.md`, `dependency-management.md` |
| Makes a lasting choice between options | New ADR in `06-project-knowledge/decisions/` |
| Establishes a convention | `coding-conventions.md` (approval: rules change) |
| Changes how agents must work | The relevant 01–05 file (approval: harness change) |
| Ships anything user-visible | `changelog.md` |
| Any meaningful change | `STATE.md` |

## 2. When

- **In the same change** as the code (feature-workflow node 8). Docs lagging code is a defect.
- **Automatic reminder [E]:** the Stop hook `.claude/hooks/sync-check.sh` fires when a turn leaves
  code changes, once per distinct change set. Respond with a **targeted** sync (STATE + only the
  files §1 maps to those changes) or `Brain: no impact` — never a full sweep.
- **Doc wrong about existing code** → fix it now and say what was wrong in the report.
- **`/brain-sync`** — explicit sweep: after merges, before releases, or when drift is suspected.

## 3. `/brain-sync` procedure

1. Run `bash .claude/hooks/brain-check.sh` (placeholders, budgets, staleness).
2. Determine scope: changes since the oldest `Last verified` date in the area (`git log --since`).
3. For each changed area, compare the code with the owning brain file (delegate wide scans to
   `context-scout`).
4. Fix drift; bump `Last verified`; list files changed and what was wrong.

## 4. Staleness detection

| Signal | Detected by |
| --- | --- |
| `Last verified` older than 90 (`BRAIN_STALE_DAYS`) days | `brain-check.sh` |
| Unfilled slots outside templates | `brain-check.sh` |
| Over-budget files (CTX-6), missing `Load when` headers (CTX-2) | `brain-check.sh` |
| Brain contradicted the code during a task | The agent — fix immediately |
| Open questions older than 30 days in `STATE.md` | Periodic review (`08-…/evaluation-strategy.md`) |
