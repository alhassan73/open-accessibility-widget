# Change Impact Analysis

> **Load when:** Large tasks (required), Medium tasks touching shared code or contracts (recommended),
> and every approval request. **Rules:** ARCH-4, ARCH-6.

## 1. Questions you must answer (with evidence, not memory)

1. **Owner** — which module owns this? (`module-boundaries.md`)
2. **Dependents** — who uses what you're changing? Search usages; count them.
3. **Contracts** — which API/schema/event/URL/config crosses a boundary? Backward compatible?
4. **Data** — does persisted data change shape? Existing rows valid after? Migration + rollback?
5. **Invariants** — which in `system-architecture.md` §6 apply, and how are they preserved?
6. **Security** — does it touch authn/z, input, secrets, data classes?
7. **Rules** — which `BR-###` are involved; do tests exist?
8. **Blast radius** — if wrong, what breaks, for whom, how visibly?
9. **Rollback** — how is it undone (revert, flag off, down-migration)?
10. **Docs** — which brain files change (`synchronization-policy.md` §1)?

## 2. Output

```markdown
### Impact: <change>
Owner: <module> · Pattern: <architectural-patterns row>
Direct changes: <files>
Dependents: <callers/consumers + counts, found by search>
Contracts: <none | list — compatible? y/n>
Data: <none | migration — rollback>
Invariants: <list — preserved by …>
Security: <none | …> · Rules: <BR-### — tests y/n>
Blast radius: <what, who> · Rollback: <how>
Needs: <ADR? approval gates?> · Docs to update: <list>
```

## 3. Rules

- Dependents come from a search, never "probably nothing else uses it".
- An incompatible contract change needs a migration path (expand → migrate → contract) or explicit
  approval to break consumers.
- If the analysis exceeds one screen, split the change (`05-graph-engineering/workflow-design.md` §3).
