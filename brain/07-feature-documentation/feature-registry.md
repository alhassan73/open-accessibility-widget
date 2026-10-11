# Feature Registry

> **Load when:** starting any feature or bugfix — find the feature folder here first.
> One row per feature. IDs are permanent.

| ID | Feature | Status | Folder | Owning module(s) | Last verified |
| --- | --- | --- | --- | --- | --- |
| F-001 | Quick profiles (7 presets) | existing — undocumented | — | `src/settings.ts`, `src/widget/ui.ts` | 2026-10-11 |
| F-002 | Text adjustments (size, page zoom, line/letter spacing, alignment, readable font) | existing — undocumented | — | `src/engine/`, `src/widget/ui.ts` | 2026-10-11 |
| F-003 | Color adjustments (contrast modes, saturation, custom colors) | existing — undocumented | — | `src/engine/`, `src/widget/ui.ts` | 2026-10-11 |
| F-004 | Reading aids (highlight headings/links, magnifier, reading line, focus window) | existing — undocumented | — | `src/engine/engine.ts`, `src/engine/css.ts` | 2026-10-11 |
| F-005 | Motion & navigation (stop animations, mute media, hide images, highlight focus/hover, large cursor) | existing — undocumented | — | `src/engine/` | 2026-10-11 |
| F-006 | Read mode | existing — undocumented | — | `src/widget/ui.ts` | 2026-10-11 |
| F-007 | Languages & RTL (English, Arabic, custom, `labels` overrides) | existing — undocumented | — | `src/labels.ts`, `src/widget.ts` | 2026-10-11 |
| F-008 | Theming (colors, radius, font, icon, logo, position, size, offset, z-index) | existing — undocumented | — | `src/widget/ui.ts`, `src/engine/css.ts`, `src/widget.ts` | 2026-10-11 |
| F-009 | Persistence & cross-tab sync | existing — undocumented | — | `src/widget.ts` | 2026-10-11 |
| F-010 | Built-ins: reset all, statement link, hide widget, skip link, `Alt+A` shortcut | existing — undocumented | — | `src/widget/ui.ts` | 2026-10-11 |
| F-011 | Owner controls: `features`, `initialSettings`, `onChange`, instance API, `subscribe` | existing — undocumented | — | `src/widget.ts`, `src/types.ts` | 2026-10-11 |
| F-012 | React adapter (`AccessibilityWidget`, `useAccessibility`) | existing — undocumented | — | `src/react.ts` | 2026-10-11 |
| F-013 | `<script>` build (`window.A11yWidget`) and demo page | existing — undocumented | — | `tsup.config.ts`, `examples/index.html` | 2026-10-11 |

**Status values:** `planned` → `in-progress` → `done` · `existing — undocumented` (found by
`/brain-init`, no folder yet) · `deprecated` · `removed <date>`.

## Rules

- New feature → row added at spec time (feature-workflow node 3), folder created from `features/example-feature/`.
- A feature changed by a task gets its `Last verified` date updated.
- `existing — undocumented` features get a folder the first time a Medium/Large task touches them.
- Never delete a row; mark it `removed <date>`.
