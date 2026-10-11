# Page reach — Overview

> **F-015** · **Status:** done · **Last verified:** 2026-10-12
> Load this first; open `testing.md` only when changing how it is verified.

## Purpose

Adjustments reach the parts of a page that page CSS alone can't: open shadow roots (web components) and
same-origin iframes. Reading aids work on touch screens, "Stop animations" also pauses script and SVG
animations, and the launcher steps aside when it would hide a focused control (WCAG 2.4.11). Cross-origin
iframes, closed shadow roots, GIFs, `<canvas>` and `requestAnimationFrame` loops stay out of reach (BR-001:
documented, never promised).

## Users

Site visitors (touch, keyboard and pointer); site owners whose pages use web components or iframes.

## Entry points

| Kind | Where |
| --- | --- |
| Engine | `createEngine(doc)` → `apply(settings)`: everything below is active only while settings aren't the defaults |
| UI | Launcher `data-yield` on `focusin` / `focusout` |

## Code map

| Concern | Path |
| --- | --- |
| Shadow roots: discovery, adopted sheet, `html.a11yw-x` → `:host` rewrite | `src/engine/shadow.ts` |
| Font sizes in shadow roots (own sheet, switched off while measuring) | `src/engine/engine.ts` `createFontScaler` |
| Same-origin frames: nested engine (`inFrame`: no scale, filters or pointer tools) | `src/engine/engine.ts` `createFrames` |
| Touch, shadow targets, frame forwarding for reading aids | `src/engine/engine.ts` `createPointerTools` |
| Script + SVG animations (1 s sweep) | `src/engine/engine.ts` `createMotionControl` |
| Media in shadow roots | `src/engine/engine.ts` `createMediaControl` |
| Launcher steps aside | `src/widget/ui.ts` `onFocusIn`, `src/engine/css.ts` `[data-yield]` |

## Notes

- No `instanceof` on page nodes in the engine: frame documents are other realms (use `nodeType`, the
  document's own constructors).
- Constructed sheets are made with the document's own `CSSStyleSheet` (can't be shared across documents);
  CSSOM isn't subject to `style-src`, so this works under the strict CSP.
- Order in `apply`: shadow roots are watched first when on, released last when off.
- Full rescan only when going non-default; later `apply`s rescan debounced (500 ms) — picks up shadow
  roots attached without any DOM change. Removed hosts/frames are released on the next mutation batch.
- Shadow roots are measured in the font scaler's rAF batch (no forced layout per component).
- Script animations: finite → `finish()` (like the CSS .01ms rule, so fade-ins arrive), endless → `pause()`;
  sweep skips hidden tabs and prunes its sets.
- Frames already holding `#a11yw-styles` run their own widget: skipped.
- Launcher check runs in rAF after focusin/focusout and on scroll (capture).
- Size: +1.85 KB gzip (24.64 KB); budget raised 24 → 25 KB (approved 2026-10-12, "handle all").

## Decisions

- none (no ADR; scope approved by the owner 2026-10-12).
