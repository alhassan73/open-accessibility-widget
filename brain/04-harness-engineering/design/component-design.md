# Component Design

> **Load when:** building or changing the widget's panel UI (`src/widget/`). **Rules:** DES-5, STD-1, STD-2.
> There is no component framework: the panel is built imperatively in `src/widget/ui.ts`.

**Last verified:** 2026-10-11

## 1. Building blocks

| Kind | Responsibility | Where |
| --- | --- | --- |
| Primitive | Element factory, ids, focus trap, clamping, logo node | `src/widget/dom.ts` (`h`, `uid`, `trapTab`, `num`, `logoNode`) |
| Icon | Inline SVG via `createElementNS` | `src/widget/icons.ts` |
| Control row | Switch (`role="switch"`), stepper (name + value announced), segmented radio group (arrow keys), profile card (`aria-pressed`) | `src/widget/ui.ts` |
| Section | Accordion (`aria-expanded`) with an active-count badge | `src/widget/ui.ts` |
| Shell | Launcher, dialog panel with focus trap, header (logo, title, subtitle, custom language combobox, close), footer | `src/widget/ui.ts` |
| Read mode | Text-only page view built from page content via `h()` | `src/widget/ui.ts` |

## 2. Rules

- Reuse an existing row builder before creating a new kind of control.
- Build DOM only with `h()` / `createElementNS`; strings become text nodes (no `innerHTML`, P-2).
- Every interactive element is a native element where possible, keyboard-operable, labelled from
  `labels.ts`, with visible focus (`10-project-standards/accessibility.md`).
- Respect the `features` option: a removed control is not rendered and its setting stays off.
- Everything lives inside the `.a11yw-ignore` root; adjustments never reach it (P-3).
- Styling: the `WIDGET_CSS` string in `src/engine/css.ts`, themed through `--a11yw-primary`,
  `--a11yw-on-primary`, `--a11yw-bg`, `--a11yw-surface`, `--a11yw-text`, `--a11yw-muted`,
  `--a11yw-border`, `--a11yw-radius`, `--a11yw-font-family`; no hard-coded colors outside defaults.
- Logical properties (`inset-inline-start`, `padding-inline-start`) so RTL works.
- User-visible text goes through `labels.ts` (English + Arabic) and the `languages` / `labels` options.
- Rendering: browser only; `createAccessibilityWidget` throws without `window`. The React adapter
  renders `null` and mounts the widget on `<body>` in an effect.
- Loading/empty/error states: not applicable — the panel fetches nothing.

## 3. Reference components

| Kind | Path |
| --- | --- |
| Switch row | `toggleRow` in `src/widget/ui.ts` |
| Focus trap | `trapTab` in `src/widget/dom.ts` |
