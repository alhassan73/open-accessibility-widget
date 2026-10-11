# Performance

> **Load when:** touching the bundle, the engine, MutationObservers, or font scaling. **Rule:** STD-3.

**Last verified:** 2026-10-11

## Budgets

| Metric | Budget | Measured by |
| --- | --- | --- |
| IIFE bundle (gzip, level 9) | ≤ 25 KB (22 → 24 KB on 2026-10-11 for the design revamp, 24 → 25 KB on 2026-10-12 for F-015; both approved; ≈ 24.3 KB) | `npm run size` (`scripts/check-size.mjs`) |
| Runtime dependencies | 0 | `package.json` |
| Host-page layout shift from the widget | none (widget is `display: contents`, fixed-position UI) | e2e "does not change the page layout" |
| Font scaling | measure each element once; no re-measure on height-only resizes | e2e "font scaling: no inline styles, no re-measure…" |
| LCP / INP / API / DB budgets | Not applicable — library without pages or server | — |

## Rules

- Measure before optimizing; report numbers (gzip size, timings) before/after.
- Bundle growth is reviewed: new code must justify its bytes; raising the budget is a gate (P-6).
- Batch DOM reads before writes in the engine; avoid work on every mutation (observers filter by attribute/child list).
- Never block the host page's rendering; mount after page load.
- No new dependency for size reasons or otherwise without approval (TOOL-2, P-5).
