# Architectural Patterns

> **Load when:** adding a new kind of thing (adjustment, control, option, entry point, test). **Rule:** ARCH-5.
> The sanctioned way to build each kind of thing in this project. Anything not listed → ARCH-3.

## 1. Sanctioned patterns

| Kind of change | Pattern | Reference implementation | Notes |
| --- | --- | --- | --- |
| Page adjustment | Setting in `types.ts` + default/validation in `settings.ts` → `flag("<name>", value)` in `engine.ts` (class `a11yw-<name>` on `<html>`, string value → `--a11yw-<name>`) → one rule in `EFFECTS_CSS` (`css.ts`) | `hideImages` / `hide-img` | Selectors must exclude the widget (`OUT`); `destroy()` resets via `apply(DEFAULT_SETTINGS)` |
| Pointer / overlay tool | Element below the widget's z-index, created in `engine.ts` | `createPointerTools`, `createBackdrop` | Never covers the panel |
| Panel control | Row builder in `widget/ui.ts` (`toggleRow`, steppers, segmented radio groups) built with `h()` | `toggleRow("hideImages", …)` | Respects `features` option; labels from `labels.ts` |
| Widget option | Field on `AccessibilityWidgetOptions` (`types.ts`), read in `widget.ts`/`ui.ts`, numbers clamped with `num()` | `zIndex`, `offset`, `statementUrl` | Public contract (ARCH-4); document in README |
| Persisted state | `loadSettings`/`saveSettings` in `widget.ts`, JSON `{ v: STORAGE_VERSION, …settings }`, parsed through `sanitizeSettings` | `src/widget.ts` | Format change = gate; bump `STORAGE_VERSION` |
| Framework adapter | Thin wrapper over `createAccessibilityWidget` + registry (`getAccessibilityWidget`, `onActiveWidgetChange`) | `src/react.ts` (`useSyncExternalStore`) | No framework code in core |
| Test | Unit: `node:test` against `dist/`; e2e: CDP page in `cdp.mjs` fixture | `test/settings.test.mjs`, `test/widget.e2e.test.mjs` | Build first |

## 2. System style

- Overall style: small layered library (entry → orchestrator → UI / engine → settings → types/labels).
- Layers (outer → inner): entries (`index.ts`, `react.ts`) → `widget.ts` → `widget/` and `engine/`
  → `settings.ts` → `types.ts`, `labels.ts`.

## 3. Pattern rules

- Copy the reference implementation's structure, naming, error handling, and test shape.
- A pattern applies whole: don't take its folder layout and skip its validation step.
- If no row fits, find the nearest one and ask before inventing (ARCH-3). Record the answer here.
- When a pattern is superseded, keep the old row marked `Deprecated — use <new>` until the last
  usage is migrated; never add new code on a deprecated pattern.
