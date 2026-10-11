# Frontend Standards

> **Load when:** building the widget UI or CSS. **Rule:** STD-1. Component structure: `04-harness-engineering/design/component-design.md`.

**Last verified:** 2026-10-11

## Stack

- Framework / rendering: none — vanilla TypeScript DOM (`h()`), browser-only · Styling: one
  injected CSS string (`src/engine/css.ts`: `EFFECTS_CSS` for the page, `WIDGET_CSS` for the panel)
  · UI library: none
- Design tokens: theme CSS custom properties `--a11yw-*` set from the `theme` option · Icons: inline
  SVG in `src/widget/icons.ts` · Fonts: inherit; `theme.fontFamily` optional

## Rules

- Use the theme variables for color, radius, and font — no ad-hoc values outside the defaults.
- Responsive breakpoints in `WIDGET_CSS`: `max-width: 560px` (panel becomes a bottom sheet) and
  `max-width: 360px` (one-column profiles).
- Logical CSS properties everywhere (RTL is supported).
- Panel CSS is scoped under `.a11yw-*` classes; page CSS only under `html.a11yw-*` and excludes the
  widget (`OUT`).
- No inline styles on host elements; CSS variables on `<html>` only (P-3).
- Keep CSS within the bundle budget (P-6); `!important` only where host styles must be overridden.
- Every string through `labels.ts` (English + Arabic) — P-7.
- SEO: not applicable (library).
- The bundle never contains secrets or network calls.

## Visual references

| What | Where |
| --- | --- |
| Design source | No design file in the repo — the demo is the reference |
| Reference screen | `examples/index.html` (after `npm run build`) / https://alhassan73.github.io/open-accessibility-widget/ |
