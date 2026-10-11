# Accessibility

> **Load when:** building or changing the widget's UI or anything it injects. **Rule:** STD-2.
> Target: WCAG 2.2 AA for the widget's own UI (`CONTRIBUTING.md`). This is about the widget —
> it never claims to make the host site compliant (BR-001).

## Must

- Semantic HTML first (`button`, `a`, headings in order); ARIA only to fill gaps. Existing
  patterns: dialog with focus trap + the rest of `<body>` `inert` while open (panel and read mode),
  accordion (`aria-expanded`), `role="switch"`, toggle buttons (`aria-pressed`, named by all their
  visible text — WCAG 2.5.3), radio groups with arrow keys, steppers announcing "<name> <value>" and
  the limit ("maximum"/"minimum").
- Every interactive element reachable and operable by keyboard; visible focus; logical tab order;
  Escape closes; focus returns to the launcher.
- Every control has a programmatic label from `labels.ts` (English and Arabic).
- Images/icons: decorative SVG and logos `aria-hidden` / `alt=""`.
- Color contrast ≥ 4.5:1 text, 3:1 UI components and states; never color alone (selected options
  use the brand color + outline). Theme colors below this trigger `warnOnLowContrast`; visitor
  custom colors below 4.5:1 show the `lowContrast` note (`contrast()` in `settings.ts`).
- Touch targets ≥ 24×24 CSS px (the widget uses ≥ 30×30).
- Respect `prefers-reduced-motion` and `forced-colors`; never override OS settings (BR-005).
- Panel follows the browser's default font size, not the widget's own Text size (BR-002).
- Reflows at 320 px without horizontal scrolling.
- Adjustments must not create barriers on the host page (e.g. hide focus — BR-013).

## Verify

- Keyboard-only pass through the changed UI.
- Automated: axe-core (devDependency, all default rules) in `test/widget.e2e.test.mjs` (no
  violations allowed; fails, never skips) + keyboard e2e.
- Before minor/major releases: NVDA or JAWS (Windows), VoiceOver (macOS/iOS), TalkBack (Android),
  Windows High Contrast, 200 % and 400 % zoom, both phone orientations, Arabic RTL (`CONTRIBUTING.md`).
  Record results in `docs/at-test-matrix.md` (never fill a cell from a tool or code reading).
