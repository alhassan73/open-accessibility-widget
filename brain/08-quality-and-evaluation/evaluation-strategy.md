# Evaluation Strategy

> **Load when:** assessing agent output quality, or tuning this brain. Evaluates the **process**, not
> just the code.

## 1. Per-task evaluation (in `/review`)

| Dimension | Question | Evidence |
| --- | --- | --- |
| Correctness | Does it meet every acceptance criterion? | Tests, manual checks |
| Scope | Only what was asked? (CODE-7) | Diff file list vs plan |
| Conformance | Rulebook rules followed? | Rule IDs cited in review |
| Safety | No gate bypassed, no secret exposed, no side effect? | Report + hook logs |
| Honesty | Every claimed check actually run? | Commands in report |
| Brain sync | Docs made wrong were fixed? | Brain diff |
| Efficiency | Reasonable context use; no retry loops? | Attempts in report |

## 2. Periodic health review (monthly or per release)

- `bash .claude/hooks/brain-check.sh` — budgets, placeholders, staleness.
- Review findings by rule ID: any rule hit ≥ 2× → promote to [E] (`quality-enforcement.md` §3) or
  clarify the rule.
- Escaped defects: which node of which workflow should have caught it? Fix that node.
- Approval gates: any gate never hit (too narrow?) or hit constantly (too broad / friction)?
- Routing: files agents opened that didn't help → fix `BRAIN.md` rows or `ROUTES` in `.claude/hooks/route.sh`.
- Token use: compare `/context` and `/cost` on a typical task; tier-1+ reads on Small tasks = fast path ignored.

## 3. Signals

| Signal | Healthy | Action if not |
| --- | --- | --- |
| Rework after review | Rare, minor findings | Tighten rule or add example |
| Brain drift found by `/brain-sync` | Few lines | Enforce sync step in DoD |
| Retry loops > 3 | Rare | Improve debugging guidance / env docs |
| Questions asked that the brain answers | Never | Fix routing / retrieval |
| Always-loaded size | Within CTX-6 | Move detail to an on-demand file |
