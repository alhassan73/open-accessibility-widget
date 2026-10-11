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
- Look (2026-10-11 revamp): brand-filled header (`--a11yw-on-primary` text; focus outline switches
  to `--a11yw-on-primary` inside it), body on `--a11yw-surface`, sections and profiles as white
  cards, icons on tinted tiles. Language menu = custom select-only combobox (`button[role=combobox]`
  + `ul[role=listbox]`, `aria-activedescendant`), never a native `<select>`; Tab closes the list
  without choosing. Header text sits on the plain brand color only (no tints behind text).
- Motion is CSS-only, using the tokens `--a11yw-ease` (arrive) and `--a11yw-spring` (state changes) and
  the keyframes `a11yw-up` / `a11yw-pop` / `a11yw-dim`. Animate `transform`, colors, and `opacity` on
  small non-text elements only: axe measures contrast through opacity, and the e2e snapshot reads
  computed `opacity`. Exit is faster than enter (panel 0.16s / 0.26s). Stagger with `--a11yw-d`.
  `prefers-reduced-motion` turns every `transition` and `animation` off.
- Every string through `labels.ts` (English + Arabic) — P-7.
- SEO: not applicable (library).
- The bundle never contains secrets or network calls.

## Visual references

| What | Where |
| --- | --- |
| Design source | No design file in the repo — the demo is the reference |
| Reference screen | `examples/index.html` (after `npm run build`) / https://alhassan73.github.io/open-accessibility-widget/ |
