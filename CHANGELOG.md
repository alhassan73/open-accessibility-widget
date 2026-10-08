# Changelog

All notable changes to this project are documented here. The project follows [Semantic Versioning](https://semver.org/).

## 1.1.1

### Fixed

- **The widget is never changed by its own adjustments.** Saturation and high-contrast filters now sit on a page-wide `backdrop-filter` layer below the widget instead of on `<html>`, and the large cursor, stop animations and dark/light `color-scheme` no longer reach the panel.
- The panel text no longer grows with the Text size setting (added in 1.1.0); it keeps following the browser's default font size.
- The release workflow skips versions that are already published to npm and publishes through npm Trusted Publishing (no token or 2FA code needed).

## 1.1.0

An accessibility, robustness and host-safety release based on a full WCAG 2.2 audit. No breaking API changes.

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
