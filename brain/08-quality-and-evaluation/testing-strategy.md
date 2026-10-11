# Testing Strategy

> **Load when:** deciding what and where to test, or handling regressions. How to iterate:
> `03-loop-engineering/testing-loop.md`.

**Last verified:** 2026-10-11

## 1. Layers

| Layer | Tests | Tool | Location | Speed |
| --- | --- | --- | --- | --- |
| Unit | Settings schema, validation, frozen exports, profile presets | `node:test` against `dist/index.js` | `test/settings.test.mjs` | ms |
| Integration | Not applicable — no services; covered by e2e | — | — | — |
| Contract | Public types via `tsc` + generated `.d.ts`; frozen-export unit test; `npm pack --dry-run` in CI | `tsc`, CI | `package.json`, `ci.yml` | s |
| E2E | Real headless Chrome over CDP against the IIFE build: keyboard, axe-core, host safety, read mode, reflow, `destroy()` | `node:test` + `test/cdp.mjs` | `test/widget.e2e.test.mjs` | ~min |
| Manual | Screen readers, Windows High Contrast, 200/400 % zoom, phone orientations, Arabic RTL | `CONTRIBUTING.md` "Manual checks before a release" | — | — |

Test business rules at the lowest layer that can; most widget behaviour needs the e2e layer.

## 2. What must be tested

- Every business rule (`BR-###`) has ≥ 1 test (gaps listed in `business-rules.md`).
- Every acceptance criterion maps to a test or a named manual check.
- Every fixed bug has a regression test; every fix/feature also gets a `CHANGELOG.md` line (P-10).
- Critical journeys (E2E): keyboard open/trap/Escape; axe-core clean panel + read mode; widget
  isolation (BR-002); `destroy()` restores the page; host layout unchanged; Trusted Types CSP;
  framework re-render and `<body>` swap; cross-tab sync.

Don't test: browser internals, trivial getters, private implementation details.

## 3. Coverage

- Target: none enforced. An uncovered branch in changed code is a review question.

## 4. Regression policy

- A regression (something that worked, now broken) is **severity ≥ major** by default.
- Fix forward only with a regression test; otherwise revert the causing change first.
- Root cause + escaped-why ("why didn't a test catch it?") go in the report; the missing test is added.
- Changes to shared code run the full suite plus the smoke list: `npm run check`.
- A test removed or skipped needs a reason in the diff and a tracking issue (ENF-2).
- e2e tests must not depend on the pointer type or timing of the machine (see commit 230fe72).
