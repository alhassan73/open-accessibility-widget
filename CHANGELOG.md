# Changelog

All notable changes to this project are documented here. The project follows [Semantic Versioning](https://semver.org/).

## 1.3.0

### Changed — project

- **New documentation site** at [open-accessibility-widget.vercel.app](https://open-accessibility-widget.vercel.app/), in English and Arabic: getting started, a page per framework, guides (theming, languages, controls and profiles, the widget's own accessibility, privacy, CSP and SRI, limitations), the API reference and this changelog, with search and a live playground that drives the real widget. It serves `sitemap.xml` (every page in both languages, with hreflang), `robots.txt` and `llms.txt` (a Markdown map of the docs for language models, generated from the same content). It is a Next.js app in `examples/` (an npm workspace), deployed by Vercel, and replaces the GitHub Pages demo (`examples/index.html`, `pages.yml`). No changes to the package.
- README banner and social preview, rendered with `npm run banner` (the e2e tests' headless Chrome, no new dependency).
- README: the Subresource Integrity example pins 1.2.0 with its real hash.

### Changed — design revamp

- **Header polish.** Heavier title; the close button is a rounded square on a soft tint of the brand color (it was a bare circle), matching the logo tile. The language menu keeps its outlined pill so its text stays at full contrast. CSS only, no class names changed.
- **New look.** The header is filled with the brand color and has a subtitle; profiles are larger icon tiles; each settings section is its own card on a soft background; steppers are pill groups; "Reset all" is a pill button; the launcher glows in the brand color.
- **Custom language menu.** The native `<select>` is replaced by a WAI-ARIA select-only combobox with a styled list: arrow keys, Home/End and type-ahead move through languages, and Enter, Space or a click picks one. Arrowing never switches the language (it used to rebuild the panel on every arrow press in Windows browsers), and Escape closes only the list.
- Label `subtitle` (English and Arabic).
- The bundle-size budget is 24 KB gzipped (was 22 KB).

### Changed — design

- **Refined panel design.** Brand-tinted header, layered shadow, profile icons on tinted tiles that fill with the brand color when the profile is on, a soft shadow on the selected option, and hover tints on steppers.
- **CSS-only motion throughout.** The panel opens with a springy rise and closes faster than it opens; profile cards and sections slide in one after another; sections slide open; switches, the check mark, counters and the "adjustments are on" dot spring into place; buttons press in; the close and reset icons turn on hover; read mode rises over a dimming backdrop.
- Motion uses only `transform`, `opacity` and colors (no layout changes), never animates text transparency, and is switched off completely by `prefers-reduced-motion`.

## 1.2.0

### Fixed — accessibility

- **Open dialogs make the page behind them inert.** While the panel or read mode is open, the rest of the page is `inert` (content added meanwhile too), so screen-reader virtual cursors can't leave the dialog (`aria-modal` alone doesn't stop them in every screen reader). `inert` the page sets itself, before or meanwhile, is left as the page set it. A click outside still closes the panel.
- **Profile cards are named by all their visible text** (title + description), so speech-input users can say what they see (WCAG 2.5.3). Found by axe-core 4.14.
- **Dark, light and custom background modes remove background images** (except on form controls, links and buttons), so text is never left on a photo or gradient with poor contrast (WCAG 1.4.3).
- **Custom colors warn about low contrast.** When the chosen text or heading color has less than 4.5:1 contrast with the background, the color section shows (and announces) a warning.
- **Steppers say when a limit is reached** ("Text size 200%, maximum") instead of staying silent.
- Read mode no longer sets an empty `lang=""` when the page has no language.

### Added

- Labels `maximum`, `minimum` and `lowContrast` (English and Arabic).
- README: "Privacy and storage", a strict CSP example, a pinned CDN snippet with Subresource Integrity, and placement advice for the launcher (WCAG 2.4.11).
- `ACCESSIBILITY.md` (accessibility statement for the widget and demo) and `docs/at-test-matrix.md` (manual assistive-technology test record).

### Changed — project

- axe-core is a devDependency: the accessibility test runs offline and fails instead of skipping when axe can't load.
- The Trusted Types test now also uses a strict CSP (nonce-only styles, `data:` images) and fails on any CSP violation.
- GitHub Actions are pinned to commit SHAs, the release workflow pins npm to 11.x, and Dependabot keeps both updated.

## 1.1.1

### Fixed

- **The widget is never changed by its own adjustments.** Saturation and high-contrast filters now sit on a page-wide `backdrop-filter` layer below the widget instead of on `<html>`, and the large cursor, stop animations and dark/light `color-scheme` no longer reach the panel.
- The panel text no longer grows with the Text size setting (added in 1.1.0); it keeps following the browser's default font size.
- The release workflow skips versions that are already published to npm and publishes through npm Trusted Publishing (no token or 2FA code needed).

## 1.1.0

An accessibility, robustness and host-safety release, checked against the WCAG 2.2 success criteria (a developer review, not an independent audit). No breaking API changes.

### Fixed — accessibility

- **Highlight links / headings / hover no longer hide the focus indicator.** Their outlines skip the focused element, so keyboard focus stays visible (WCAG 2.4.7).
- **Mute media** only mutes media that starts on its own. Media the visitor plays or unmutes keeps its sound (it used to be re-muted on every play).
- **The `Alt+A` shortcut no longer swallows typed characters**, e.g. macOS Option+A ("å", Polish "ą") in form fields.
- **Reading line, focus window and text magnifier follow keyboard focus**, stay below the widget panel, and Escape dismisses the magnifier (WCAG 2.1.1, 1.4.13).
- **Selected options in the segmented controls** use the brand color: 5:1 state contrast instead of 1.1:1 (WCAG 1.4.11).
- **Hide images** keeps controls usable: images inside links/buttons, image buttons and form-control backgrounds (e.g. checkbox ticks) stay visible, and alt text stays available to screen readers.
- **Dark / light / custom background modes** set `color-scheme`, keep selected/pressed states visible with an outline, keep links underlined when a custom text color is chosen, switch off in forced-colors mode, and don't apply when printing.
- **Read mode** reads the page in its own language and direction, keeps links, table cells, image alt text and text in `<div>`s, and its title is "Read mode".
- **Steppers** announce "Text size 120%" (name + value) and their buttons reference the current value; percentages are formatted for the widget's language (`Intl.NumberFormat`).
- The panel text grows with the Text size setting (up to 150%) and follows the browser's default font size.
- The launcher's "adjustments are on" dot is also exposed to screen readers and has enough contrast.
- The large cursor keeps its meaning: a large hand on links and buttons, the text bar in fields.
- Letter spacing is not applied to Arabic and other cursive scripts.
- **Skip link** is only added when there is a `<main>`/`<h1>` to skip to and the page doesn't already have its own; it prefers `<main>` over a header `<h1>`, and the temporary `tabindex` is removed afterwards.
- "Hide widget" is only offered on devices with a keyboard-friendly pointer, where the shortcut can bring it back.
- "Justify" was removed from text alignment: uneven word spacing makes text harder to read.
- The "Screen reader user" profile is now called "Quiet media", which is what it does. Profile ids are unchanged.

### Fixed — host pages and robustness

- The widget no longer changes the page layout (it was a grid/flex item of `<body>`).
- **Stop animations** keeps `transitionend` / `animationend` events firing, catches videos that start later, and only resumes silent videos when switched off.
- Works under a **Trusted Types** CSP (no `innerHTML`).
- Survives frameworks re-rendering `<html class>` / `<html style>` and pages swapping `<body>` (Turbo, htmx, Astro view transitions).
- Font scaling no longer writes inline styles; it no longer re-measures on height-only resizes (mobile URL bar) and is about 40% faster on very large pages.
- Color filters are disabled in forced-colors (Windows High Contrast) mode.
- Invalid options (`offset`, `buttonSize`, `zIndex`) are clamped instead of hiding the launcher.
- `toggleProfile()` with an unknown id is ignored (it used to corrupt state and then throw).
- An exception in `onChange` or a `subscribe` listener no longer leaves the panel out of sync.
- `getState()` / `getSettings()` return frozen snapshots; exported constants (`PROFILE_PRESETS`, `RANGES`, labels) are frozen.
- `setSettings({ profiles })` applies the profiles' adjustments; turning a profile off keeps adjustments the visitor changed afterwards.
- Settings stay in sync across tabs; the saved format is versioned.
- React adapter: removing a prop now resets that option; `useAccessibility().widget` is `null` during server render and hydration.
- `destroy()` leaves no empty `style` attribute behind.

### Added

- `features` option to remove individual controls (`{ hideImages: false, readMode: false }`).
- `initialSettings` option for first-time visitors.
- `FeatureKey` and `SettingKey` types.
- `{label}` placeholder for the `increase` / `decrease` / `reset` labels; RTL detection for custom languages without `dir`.
- Theme contrast warnings now also check focus outlines, links and panel text.
- Test suite (unit + headless Chrome end-to-end with axe-core), CI on every pull request, a bundle-size budget, and a release workflow with npm provenance.
- Docs: profiles table, limitations, preference precedence, Angular `runOutsideAngular`, SECURITY.md, CONTRIBUTING.md.

### Size

The `<script>` bundle is about 20 KB gzipped (was 17 KB).

## 1.0.1

- Docs: link to the [live demo](https://alhassan73.github.io/open-accessibility-widget/) on GitHub Pages. No code changes.

## 1.0.0

First release:

- Framework-agnostic core (`init`) plus a React adapter and a `<script>` build.
- 7 quick profiles; text, color, reading-aid and motion/navigation adjustments; read mode.
- Theming (colors, radius, font, logo), English and Arabic with RTL, custom languages.
- Settings saved per visitor, an `Alt+A` shortcut, a skip link and a "Hide widget" option.
- An accessible widget UI: dialog, accordion, switches and radio groups, and an animated open/close that respects reduced-motion settings.
