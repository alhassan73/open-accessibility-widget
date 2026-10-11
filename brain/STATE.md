# Project State

Working memory. The SessionStart notice shows its goal, in-progress items, and open-question count;
read this file only when continuing earlier work. Update after every meaningful change.
Keep it under ~150 lines — move finished history to `09-knowledge-maintenance/changelog.md`.

**Last updated:** 2026-10-12

## Current phase

Maintenance after release 1.3.0 (tag `v1.3.0`, pushed 2026-10-12; npm publish by `release.yml`).

## Current goal

Not set — owner to choose the next milestone (see Open questions).

## In progress

<!-- One line per active unit: what, owner/branch, status, next step. -->
- [ ] Record the 1.2.0 manual AT round — owner reported the checks done (2026-10-11) but `docs/at-test-matrix.md` still says "Not tested"; next: owner sends results, agent records them (never filled from tools/code).
- [ ] Docs site go-live: Vercel project created + Git-connected (2026-10-12, CLI), production deploys from `main`; live and smoke-tested, repo website field points to Vercel; next: disable GitHub Pages (needs owner's OK).

## Next up

1. Owner answers the open questions below; agent folds the answers into the named files.
2. Open compliance gaps (2026-10-11 review; record in `09-knowledge-maintenance/changelog.md`):
   - P0-1 ACR / VPAT 2.5 (WCAG 2.2 AA + EN 301 549) — after an AT round in `docs/at-test-matrix.md`; owner/evaluator only.
   - P0-2 AT round: NVDA+Firefox/Chrome, JAWS+Chrome, VoiceOver macOS/iOS, TalkBack, speech input, Windows contrast, 200/400 % zoom.
   - P0-5 ⚖️ default `persist` + profile ids in `localStorage` — docs only until legal advice; options: save adjustments without profile ids (STORAGE_VERSION 2), or a consent API.
   - P2-2 live region recreated on rebuild (announcement can be lost) · P2-5 control borders ≈1.2:1 (passes; icons carry meaning) · P2-6 optional visible label for the language select.

## Open questions

<!-- Every **Open question:** raised anywhere in the brain, with where it lives. Remove when answered. -->
- Next goal / milestone after 1.1.1 — this file §Current goal.
- Branch naming for non-release work (observed `review/compliance`) — `04-harness-engineering/coding/coding-conventions.md` §5. Default: `<topic>/<slug>` from `main`.
- Why `overrides.esbuild ^0.28.2` was added (commit 11e58d7, 1.1.0) — `04-harness-engineering/tools/dependency-management.md` §3. Assumption: an `npm audit` advisory.
- Deprecation policy for public API — `10-project-standards/compatibility.md`. Default: breaking changes only in a major; deprecate in a minor first with a CHANGELOG note.
- Allowed licenses for devDependencies — `dependency-management.md` §2. Default: MIT, ISC, BSD-2/3, Apache-2.0. Note: `axe-core` (approved 2026-10-11) is MPL-2.0, test-only.
- Not approved in the 2026-10-11 round, still open: P1-5 text-spacing preset (stored format), P1-8 CodeQL/Scorecard/SBOM, P1-11 Firefox CI, P2-10 React 18 CI, protected `environment: npm` for release.
- Questions for a lawyer ⚖️ (2026-10-11 review): is default `localStorage` persistence "strictly necessary" (ePrivacy Art. 5(3)); are profile ids (`visionImpaired`, `cognitiveDisability`…) health data under GDPR Art. 9; can README/npm/demo read as a compliance claim under the FTC standard; does the widget provider have direct EAA/AODA/PSBAR duties; which EN 301 549 version should the ACR target while v4.1.1 isn't in the OJ; any Egyptian rules for private websites.
- Lint/format: none configured — `quality-enforcement.md` §1. Default: keep none; adding one is a TOOL-2 gate.
- Manual `bash .claude/hooks/brain-check.sh` is blocked in agent shells by the lean-ctx allowlist — owner may run `lean-ctx allow bash` (hooks themselves are unaffected).

## Blocked

<!-- What is blocked, on what/whom, since when. -->
- None.

## Recently completed

<!-- Last ~10 items, newest first, with date and commit/PR. Older → changelog. -->
- 2026-10-12 — Release 1.3.0 (version branch `1.3.0` → `main`, tag `v1.3.0`): design revamp, header polish, docs site.
- 2026-10-12 — Docs site in `examples/` (Next.js 16 App Router, en/ar, Vercel) replaces the Pages demo and `pages.yml`; README banner via `npm run banner`; README + docs SRI example now `@1.3.0` with its real hash. Approved: `examples` workspace deps, Vercel `*.vercel.app` URL, en+ar, banner via `test/cdp.mjs`.
- 2026-10-11 — Design revamp (branch `design/widget-revamp`): brand hero header + subtitle, card sections, tile profiles, pill steppers, custom ARIA language combobox (closes P1-2). Approved: direction, custom listbox, size budget 22 → 24 KB (now 22.68 KB).
- 2026-10-11 — Design refresh, CSS-only motion (merged to `main` 2aeca9d): tinted header, icon tiles, layered shadow, staggered entrance, spring switches and badges, read-mode rise; reduced-motion off; 21.71/22 KB gzip (≈0.3 KB headroom left).
- 2026-10-11 — Release 1.2.0 published to npm via tag `v1.2.0` (Trusted Publishing, provenance); CI + demo deploy green.
- 2026-10-11 — Version branch `1.2.0` from `main`: merged `chore/agent-brain` (1532f0b) and `review/compliance` (373686b), version 1.2.0, merged into `main`.
- 2026-10-11 — Compliance fixes (373686b): inert behind dialogs, profile-card names (2.5.3), color-mode background images, contrast warning, stepper limits, axe devDep (no skip), strict-CSP test, SHA-pinned actions + Dependabot, privacy/CSP/SRI docs, `ACCESSIBILITY.md`, AT matrix template. Approved gates: axe-core devDep, labels `maximum`/`minimum`/`lowContrast`, workflow edits, privacy docs only.
- 2026-10-11 — Compliance review (WCAG 2.2 AA, EAA/EN 301 549, ADA, FTC, privacy, supply chain, competitors); the report file was removed after its outcome was recorded in `09-knowledge-maintenance/changelog.md` §Record.
- 2026-10-11 — Project brain installed and initialized (uncommitted).
- 2026-10-08 — Release 1.1.1: widget unaffected by its own adjustments; npm Trusted Publishing (27ea5f5, 0aa6a6b, 230fe72).
- 2026-10-08 — Release 1.1.0: accessibility, host-safety and robustness fixes (11e58d7).

## Session handoff

<!-- Overwrite at the end of each session: what the next session must know that is not elsewhere.
     Half-finished edits, failing checks, hypotheses being tested, commands that were slow/flaky. -->
- `npm test` runs against `dist/` — build first. e2e needs Chrome/Edge (`CHROME_PATH`); axe-core now
  comes from devDependencies (run `npm ci` after pulling).
- Open compliance gaps: §Next up item 2; lawyer questions: §Open questions.
- `npm install` now also installs the docs site (workspace `examples`). Docs text lives in
  `examples/messages/{en,ar}.json` (same keys); the site imports the widget from `src/`, so widget
  changes show in `npm run dev` without a build.
