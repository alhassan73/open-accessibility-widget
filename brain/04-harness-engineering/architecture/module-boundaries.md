# Module Boundaries

> **Load when:** deciding where code goes or changing code owned by another module. **Rule:** ARCH-1.

**Last verified:** 2026-10-11

## 1. Ownership table

| Module / path | Owns | Public surface (what others may use) | Must not |
| --- | --- | --- | --- |
| `src/index.ts` | npm/IIFE public API | Named exports only (public contract) | Contain logic |
| `src/react.ts` | React adapter, `"use client"` entry | `AccessibilityWidget`, `useAccessibility`, re-exports of `index` | Duplicate core logic; mount anything itself (it renders `null`) |
| `src/widget.ts` | Lifecycle, single-instance registry, state, persistence, cross-tab sync, theme contrast warnings | `createAccessibilityWidget`, `getAccessibilityWidget`, `onActiveWidgetChange` | Build DOM or CSS itself |
| `src/settings.ts` | Settings schema: defaults, ranges, enums, profiles, validation | `DEFAULT_SETTINGS`, `RANGES`, `PROFILE_*`, `sanitizeSettings`, merge/toggle helpers, `contrast()` | Read storage or DOM |
| `src/types.ts` | Public types | Types only | Hold values |
| `src/labels.ts` | UI strings (en + ar), built-in languages | `defaultLabels`, `arabicLabels`, `builtInLanguages`, label types | Hold non-string config |
| `src/engine/` | Everything applied to the host page: `<html>` classes/vars, font scaler, pointer tools, backdrop filter, media control; the one stylesheet (`css.ts`) | `createEngine`, `injectStyles`, `removeStyles` | Know about the panel UI |
| `src/widget/` | The panel: launcher, sections, controls, read mode, focus handling, icons | `createUI`, `widgetZIndex`; `dom.ts` helpers | Change host-page styles |
| `test/` | Unit + e2e suites, CDP driver | — | Ship in the package |
| `scripts/` | Build-time checks (size budget) | — | Ship in the package |
| `examples/` | Demo / playground page | — | Be imported by `src/` |

## 2. Boundary rules

- Each concern has exactly one owner. If two modules seem to own it, that's a finding — ask.
- Other modules use only the **public surface**. Never import a module's internals (ARCH-2).
- Shared code goes in the shared module only when ≥ 2 modules need it now (CODE-3).
- `widget.ts` orchestrates: UI events → settings → engine + storage + listeners.
- Cross-boundary data is passed as typed contracts (`AccessibilitySettings`, `UiApi`, `UiLocale`).

## 3. Where new code goes

1. Find the owning module in §1.
2. Within it, follow the pattern from `architectural-patterns.md`.
3. No owner fits → propose one (new module = ARCH-3 gate).
