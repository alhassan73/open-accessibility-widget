# Refactoring Workflow

> **Load when:** restructuring without behaviour change (`/refactor`). Rules: `04-harness-engineering/coding/refactoring-rules.md`.

```mermaid
flowchart TD
  A[1 Intake: why + boundaries] --> B[2 Baseline: gates green, coverage check]
  B -->|thin coverage| C[3 Characterization tests] --> D
  B -->|covered| D{Public contract / shared code / > 1 module?}
  D -->|yes| E{{◆ Approval + plan}} --> F
  D -->|no| F[4 Mechanical steps, green after each]
  F -->|red| R[Revert last step → smaller step]
  R --> F
  F --> G[5 Verify: same tests, unchanged, pass]
  G --> H[6 Review diff: no behaviour change]
  H --> I[7 Sync + Report]
```

| # | Node | Exit check |
| --- | --- | --- |
| 1 | Intake | The problem with the current shape; modules in scope; explicit "no behaviour change" |
| 2 | Baseline | All gates pass **before** touching code. Red baseline → report; don't refactor on red |
| 3 | Characterization | Tests pin current behaviour (including quirks) |
| ◆ | Approval | Contract or shared-code changes; plan uses expand → migrate → contract |
| 4 | Steps | One mechanical step at a time; red → revert, not debug forward |
| 5 | Verify | Same tests, unmodified, pass; build artifacts/outputs equivalent where checkable |
| 6 | Review | Diff contains no behaviour change; any found → split it out |
| 7 | Sync | `system-architecture.md` / `module-boundaries.md` / `code-patterns.md` if structure changed |
