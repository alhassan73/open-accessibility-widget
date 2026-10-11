# Accessibility statement

This statement covers the **open-accessibility-widget's own interface** (launcher, panel, read mode) and
its [documentation site and live demo](https://open-accessibility-widget.vercel.app/). It does not cover the websites
that embed the widget: each site is responsible for its own accessibility, and the widget does **not**
make a site ADA, EAA, EN 301 549 or WCAG compliant.

## Target

WCAG 2.2 Level AA for the widget's own interface. We make no EN 301 549 conformance claim.

## Status

**Not yet independently audited.** We don't claim conformance.

What is checked today:

- Every pull request runs end-to-end tests in headless Chrome: keyboard-only use, focus handling,
  axe-core with no violations allowed (panel and read mode), reflow at 320px, forced colors, reduced
  motion, and a strict Content Security Policy.
- Manual checks with screen readers and other assistive technology are recorded in
  [`docs/at-test-matrix.md`](./docs/at-test-matrix.md). Until a round is recorded there, treat screen-reader
  support as untested.

## Known limitations

- The launcher is fixed in a bottom corner and can cover a focused control that sits in that corner
  on the host page (WCAG 2.4.11). Sites can move it with `offset` / `position`.
- Firefox and Safari aren't covered by CI; they rely on manual testing.
- Page adjustments don't reach inside iframes or Shadow DOM.
- More: the README's [Limitations](./README.md#limitations) section.

## Feedback

Report an accessibility problem in a
[GitHub issue](https://github.com/alhassan73/open-accessibility-widget/issues) with the browser,
assistive technology and steps to reproduce. Security problems: see [SECURITY.md](./SECURITY.md).

_Last reviewed: 2026-10-11._
