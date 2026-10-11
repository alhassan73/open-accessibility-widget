# Project Context Card

> **Load when:** before the first Medium/Large edit of a session, or you need a command/path fact.

Operational facts an agent needs in every session that touches code. Facts only — the *why* lives
in `06-project-knowledge/`. Keep under ~100 lines.

**Last verified:** 2026-10-11

---

## Identity

- Name: open-accessibility-widget (npm package, MIT, author `alhassan-ahmed`)
- What it is: framework-agnostic accessibility preferences widget — a user-preference menu, not a
  compliance tool (`README.md` line 11)
- Repo type: library (single npm package; browser-only runtime)
- Default branch: `main` (always the latest release; deploys the demo) · Branch naming: one branch
  per version named `X.Y.Z` (e.g. `1.1.1`), tags `vX.Y.Z` (`CONTRIBUTING.md`); other work branches:
  **Open question:** (observed `review/compliance`)

## Stack

| Layer | Technology + version | Notes |
| --- | --- | --- |
| Language | TypeScript ^5.9.3, `strict` (`tsconfig.json`) | Output target es2019 (`tsup.config.ts`) |
| Framework | None — vanilla DOM; optional React ≥ 18 adapter (`src/react.ts`) | Zero runtime dependencies |
| Data | Not applicable — no backend; visitor settings in browser `localStorage` | Key `a11yw-settings`, versioned |
| Build | tsup ^8.5.1 → ESM + CJS + `.d.ts` (`index`, `react`) and IIFE `open-accessibility-widget.global.js` | `globalName: A11yWidget` |
| Package manager | npm (`package-lock.json`) | Use only this one. |
| Tests | `node:test` unit + headless Chrome over CDP (`test/cdp.mjs`) + axe-core 4.x (devDependency) | Node ≥ 22 (global WebSocket) |
| CI | GitHub Actions: `ci.yml`, `release.yml` | Node 22 |
| Docs site | `examples/` npm workspace: Next.js 16 App Router, next-intl (en/ar), Tailwind 4, shadcn/Radix | Deployed by Vercel (Root Directory `examples`); imports the widget from `src/` |

## Commands

| Purpose | Command | Gate? |
| --- | --- | --- |
| Install | `npm install` (CI: `npm ci`) | Approval if it changes the lockfile |
| Dev | `npm run dev` — docs site on :3000, widget from `src/` | |
| Docs site | `npm run typecheck -w examples` · `npm run site` (production build) | Yes, when `examples/` or `src/` changes |
| Banner | `npm run banner` — renders `.github/assets/*.png` with `test/cdp.mjs` | |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | Yes |
| Lint | n/a — no linter configured | Risk logged in `STATE.md` |
| Format | n/a — no formatter configured | |
| Build | `npm run build` (`tsup`) | Yes |
| Size | `npm run size` — IIFE ≤ 25 KB gzip (`scripts/check-size.mjs`); after build | Yes |
| Test (all) | `npm test` (`node --test "test/*.test.mjs"`); runs against `dist/` — build first | Yes |
| Test (one) | `node --test test/settings.test.mjs` · `node --test --test-name-pattern="<name>" test/widget.e2e.test.mjs` | While iterating |
| All gates | `npm run check` = typecheck → build → size → test (also `prepublishOnly`) | Yes |

Gate semantics: `04-harness-engineering/enforcement/quality-enforcement.md` §Gates.

## Repository map

```
src/                 library source (TypeScript)
  index.ts           public entry: init/createAccessibilityWidget, constants, types
  react.ts           React adapter: <AccessibilityWidget>, useAccessibility (re-exports index)
  widget.ts          orchestrator: single-instance registry, state, storage, cross-tab sync
  settings.ts        settings schema: defaults, ranges, profiles, sanitizeSettings
  types.ts           public types (options, settings, instance)
  labels.ts          UI strings: English + Arabic, builtInLanguages
  engine/            page adjustments: engine.ts (classes/vars, font scaler, pointer tools), css.ts (one stylesheet)
  widget/            panel UI: ui.ts (panel, controls, read mode), dom.ts (h(), focus trap), icons.ts (SVG)
test/                settings.test.mjs (unit), widget.e2e.test.mjs (e2e), cdp.mjs (Chrome driver)
scripts/             check-size.mjs (bundle budget), render-banner.mjs (README banner + social preview)
examples/            docs site + live playground (Next.js workspace, en/ar); deployed by Vercel
  messages/          en.json, ar.json: every docs string (both languages, same keys)
  src/content/       framework snippets, API tables, guide sections (data, English code)
.github/assets/      banner.html, social-preview.html (+ rendered PNGs, OFL fonts)
.github/workflows/   ci.yml, release.yml
dist/                build output (git-ignored; published to npm)
```

## Where things go

| I need to add… | It goes in… | Copy from |
| --- | --- | --- |
| A page adjustment (setting) | `types.ts` → `settings.ts` (default/range/enum) → `engine/engine.ts` `flag()` → `engine/css.ts` rule → `widget/ui.ts` row → `labels.ts` (en + ar) | `hideImages` |
| A widget option | `types.ts` `AccessibilityWidgetOptions` → `widget.ts` / `widget/ui.ts` → README "All options" | `statementUrl` |
| A UI string | `src/labels.ts` — `defaultLabels` **and** `arabicLabels` | any key |
| An icon | `src/widget/icons.ts` (createElementNS) | existing icons |
| A unit test | `test/*.test.mjs` against `dist/index.js` | `test/settings.test.mjs` |
| An e2e test | `test/widget.e2e.test.mjs` (fixtures via `test/cdp.mjs`) | "destroy() restores the page" |
| A user-visible change note | `CHANGELOG.md` | latest section |

## Reference implementations

| Kind | Path |
| --- | --- |
| Boolean page adjustment end to end | `hideImages`: `src/settings.ts`, `src/engine/engine.ts` (`flag("hide-img")`), `src/engine/css.ts`, `src/widget/ui.ts` |
| Input validation | `sanitizeSettings` in `src/settings.ts` |
| Safe DOM building | `h()` in `src/widget/dom.ts` |
| e2e test | `test/widget.e2e.test.mjs` |

## Environments

Names and scope only — details in `04-harness-engineering/tools/execution-environment.md`.
Required env var **names** (never values): none. Optional for tests: `CHROME_PATH`; `CI` adds `--no-sandbox`.
