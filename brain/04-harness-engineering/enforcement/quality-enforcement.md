# Quality Enforcement

> **Load when:** running gates, a gate fails, or changing how a rule is enforced. **Rules:** ENF-1…4.

## 1. Gates

Run in this order (the order of `npm run check`). All must pass before "done" (ENF-1).

| # | Gate | Command | Proves | If absent |
| --- | --- | --- | --- | --- |
| 1 | Format | none configured | — | Skip; match the file (CODE-2) |
| 2 | Typecheck | `npm run typecheck` | Types/contracts consistent | — |
| 3 | Lint | none configured | — | Review covers it ([R]); logged in `STATE.md` |
| 4 | Build | `npm run build` | ESM/CJS/IIFE + `.d.ts` build | — |
| 5 | Size | `npm run size` | IIFE ≤ 22 KB gzip (needs the build) | — |
| 6 | Tests | `npm test` | Unit + e2e behaviour (needs the build) | — |
| 7 | Brain check | `bash .claude/hooks/brain-check.sh` | Brain budgets, placeholders, staleness | — |

One command for 2, 4, 5, 6: `npm run check`. CI (`ci.yml`) also runs `npm audit --audit-level=moderate`
and `npm pack --dry-run`. axe-core comes from devDependencies, so the axe test fails (never skips) if it can't load.
Report each as `pass` / `fail (output)` / `not run (reason)`. Never "should pass".

## 2. Mechanism map — what backs each [E] rule

| Rule | Mechanism | Where |
| --- | --- | --- |
| CTX-4 secrets | Permission deny + bash guard | `.claude/settings.json`, `.claude/hooks/guard-bash.sh` |
| CTX-6 budgets | Line-count check | `.claude/hooks/brain-check.sh` |
| CODE-1 style | Type config only — no linter/formatter | `tsconfig.json` |
| CODE-5 types | `tsc` strict | `tsconfig.json` |
| ARCH-2 imports | none — [R] only | — |
| TOOL-1 tiers | Permission allow/ask/deny | `.claude/settings.json` |
| TOOL-3 destructive git/shell | Bash guard (deny/ask) | `.claude/hooks/guard-bash.sh` |
| ENF-1 gates | CI pipeline on every PR and push to `main` / version branches | `.github/workflows/ci.yml` |
| P-2 no HTML parsing | e2e "works under a Trusted Types CSP" | `test/widget.e2e.test.mjs` |
| P-3 widget isolation | e2e "the widget itself is never changed by its own adjustments" | `test/widget.e2e.test.mjs` |
| P-4 `destroy()` restores | e2e "destroy() restores the page" | `test/widget.e2e.test.mjs` |
| P-6 bundle budget | `scripts/check-size.mjs` (`npm run size`) | CI + `prepublishOnly` |
| P-8 widget a11y | axe-core e2e, keyboard e2e | `test/widget.e2e.test.mjs` |
| Release gates | `prepublishOnly` = `npm run check`; tag must match `package.json` version | `package.json`, `release.yml` |
| Brain sync after code changes | Stop hook (targeted sync request) | `.claude/hooks/sync-check.sh` |
| CTX-1/CTX-8 load only what fits | `[route]` line per prompt + SessionStart STATE notice | `.claude/hooks/route.sh`, `brain-check.sh --session` |
| Protected paths | Permission ask | `.claude/settings.json` |

[R] rules are enforced by the review loop (`03-loop-engineering/review-loop.md`) and `/review`.

## 3. Promoting a rule from [R] to [E]

A rule violated twice in review should become mechanical: type, test, hook, or CI step.
Propose it (it edits protected config → approval), then update the rulebook tag and §2.

## 4. Weakening is forbidden (ENF-2)

Raising the size budget, adding `skip`/`only`, loosening `tsconfig.json`, editing a hook, or
bypassing CI to get green is a blocker — unless the user explicitly asks, and then it is its own
visible change with a reason.
