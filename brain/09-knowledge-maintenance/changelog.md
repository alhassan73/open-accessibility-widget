# Changelog

> **Load when:** releasing, or needing history older than `STATE.md` §Recently completed.
> Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Newest first. Absolute dates.

## [Unreleased]

### Added
- 2026-10-12 — F-018 from the competitor research: read aloud, page structure, bold text, invert colors, alt text in the magnifier, `feedbackUrl` (labels in 16 languages). Dark panel retuned to the owner's charcoal/teal mock-up.

### Security
- 2026-10-12 — Magnifier never shows a password field's value (it did since the magnifier shipped); read aloud never speaks any field's value.

### Changed
- 2026-10-12 — Budget 26 → 28 KB (owner picked all four features knowing the cost); `safeUrl` also allows `mailto:`.

## [1.3.2] — 2026-10-12 (tag `v1.3.2`, published to npm)

### Added
- 2026-10-12 — F-016 `colorScheme` option (auto/light/dark); F-017 optional language pack (`./languages`, `./global/languages`).

### Changed
- 2026-10-12 — Icon-only language button, smaller title/subtitle, widget scrollbar isolated; budget 25 → 26 KB (owner-requested features). Docs site: all languages in the demo widget, logo → top of home (JSON-LD after content + `data-scroll-behavior`), footer layout, Egyptian Arabic.

## [1.3.1] — 2026-10-12 (tag `v1.3.1`, published to npm)

### Added
- 2026-10-12 — F-015 page reach: open Shadow DOM, same-origin iframes, touch reading aids, script/SVG animation pause.

### Fixed
- 2026-10-12 — Compliance review P1-1 (launcher can cover a focused control, WCAG 2.4.11): the launcher steps aside.

### Changed
- 2026-10-12 — Size budget 24 → 25 KB (approved). Docs site scrollbar follows the light theme.

## [1.3.0] — 2026-10-12 (tag `v1.3.0`, published to npm)

### Added
- 2026-10-12 — Docs site in `examples/` (Next.js, en/ar, Vercel; sitemap, robots, llms.txt), README banner (`npm run banner`), ADR-0001.

### Changed
- 2026-10-11 — Design revamp (brand header + subtitle, cards, custom ARIA language combobox) and CSS-only motion; size budget 24 KB.
- 2026-10-12 — Widget header: heavier title, soft-tint rounded close button (CSS only). README and docs SRI example pinned to 1.3.0.

### Removed
- 2026-10-12 — GitHub Pages demo (`examples/index.html`, `pages.yml`).

## [1.2.0] — 2026-10-11 (tag `v1.2.0`, published to npm)

### Added
- 2026-10-11 — Project brain installed and initialized.
- 2026-10-11 — `ACCESSIBILITY.md`, `docs/at-test-matrix.md`, `.github/dependabot.yml`; labels `maximum`/`minimum`/`lowContrast`; README privacy/CSP/SRI sections.

### Changed
- 2026-10-11 — axe-core is a devDependency (test fails, never skips); actions pinned to SHAs; npm `^11.5.1` in release.

### Fixed
- 2026-10-11 — Page `inert` behind open dialogs (incl. content added meanwhile; page's own `inert` kept); profile-card names (WCAG 2.5.3); color modes drop background images (not on controls/links/buttons); custom-color contrast warning; stepper limit announcements; no `lang=""` in read mode. Details: root `CHANGELOG.md` §Unreleased.

### Removed
- 2026-10-11 — `COMPLIANCE_REVIEW.md` (never committed): outcome recorded below, open items moved to `STATE.md`.

### Security

## Record: compliance review 2026-10-11 (release 1.1.1, branch `review/compliance`)

Engineering review, not legal advice. Six web-research agents (WCAG 2.2 AA, EAA/EN 301 549, ADA/508,
FTC, privacy/security, competitors), every finding re-checked against the code.

- **Verdict:** no WCAG 2.2 AA failure found in the widget UI by code review + axe; not provable yet —
  no ACR/VPAT and no recorded screen-reader testing.
- **Standards baseline (secondary sources marked †, verify before quoting):** WCAG 2.2 AA (4.1.1
  removed); EN 301 549 v3.2.1 harmonised, v4.1.1 (WCAG 2.2) reportedly published 2026-09-02 †;
  EAA applies since 2025-06-28 to host services; ADA Title II deadlines reportedly 2027-04-26 /
  2028-04-26 †; FTC final order vs accessiBe 2025-04-22 ($1M, 20 yrs) bars unsubstantiated
  "automated compliance" claims — the main legal risk for this product is what it claims (BR-001).
- **Fixed:** P0-3, P0-4, P0-6, P0-7, new 2.5.3 finding, P1-3, P1-4, P1-7, P1-9, P1-10, P1-12, P1-14,
  P2-3, P2-4, P2-8, P2-9. **Documented only:** P0-5 (owner's choice pending legal), P1-1 (launcher
  can cover a focused control in its corner — 2.4.11), P1-6, P1-11, P1-13.
- **Won't fix / no change:** P2-1 (focus to launcher after read mode), P2-7 (logo URL scheme check
  would break `data:` logos; `<img>` can't run script), P2-11 (`wcag` npm keyword).
- **Open:** see `STATE.md` §Next up / §Open questions.
- **Competitors:** accessiBe (FTC order), UserWay (class action over "legal protection" claims),
  AudioEye, EqualWeb, Recite Me, acc_toolbar, One Click Accessibility (WP). None publishes an ACR
  for its own widget — publishing ours plus an AT matrix is the differentiator.
- **Primary sources:** w3.org/WAI/WCAG22/quickref · WAI-ARIA APG patterns · ftc.gov accessiBe final
  order (2025-04) · OWASP Third-Party JavaScript Management cheat sheet · docs.npmjs.com/trusted-publishers.
