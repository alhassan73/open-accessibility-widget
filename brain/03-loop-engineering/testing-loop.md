# Testing Loop

> **Load when:** writing or running tests. *What* to test per layer: `08-quality-and-evaluation/testing-strategy.md`.
> **Rules:** ENF-1, ENF-2.

```
Write/adjust test → run → FAILS for the right reason → implement → PASSES → run neighbours → next case
```

- **Bug fix:** failing test reproducing the bug first, when the layer is testable.
- **Feature:** ≥ 1 test per acceptance criterion + the main error path.
- **Refactor:** existing tests pass unchanged before and after; add characterization tests first if thin.

| Situation | Run |
| --- | --- |
| Iterating | One test/file — `node --test test/settings.test.mjs` or `node --test --test-name-pattern=<name> test/widget.e2e.test.mjs` |
| Increment done | The touched module's tests |
| Before "done" | `npm run check` + all gates |

## Rules

- Never delete, skip, or loosen an assertion to get green (ENF-2). A wrong test is fixed as a visible,
  justified change.
- Never accept snapshot/golden updates without reading the diff.
- Deterministic: control time, randomness, network, ordering.
- Never hit production or real side effects (TOOL-4).
- Test through the public surface, not private internals.
- Flaky = bug: report it and record it in the feature's `testing.md`; don't rerun until green.
- No suite? Say so, run the spec's manual check, and report exactly what was verified.
