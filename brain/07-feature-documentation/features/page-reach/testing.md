# Page reach — Testing

> **F-015** · **Last verified:** 2026-10-12

| Criterion | Test (`test/widget.e2e.test.mjs`) |
| --- | --- |
| Launcher steps aside for a keyboard-focused control under it (also one scrolled into view), stays in tab order | "the launcher steps aside for a focused control under it (WCAG 2.4.11)" |
| Endless script + SVG animations paused (also later ones), finite ones finished; only ours resumed | "stop animations stops script and SVG animations, and resumes only the ones it paused" |
| Component defined after settings applied is styled after the next change | "a component defined after the settings were applied is picked up at the next change" |
| Frame running its own widget untouched | "a frame that runs its own copy of the widget is left to it" |
| Reading aids follow a tap; magnifier survives the touch `pointerleave` | "reading aids follow a tap on touch screens" |
| Shadow roots styled, later components found, no double font scaling, cleaned up, strict CSP | "adjustments reach open shadow roots, under a strict CSP, and are taken out again" |
| Same-origin frames adjusted (no scale), later frames found, mask follows pointer in a zoomed frame, cleaned up | "same-origin iframes get the same adjustments; reading aids follow the pointer into them" |

## Known gaps

- Not tested: release of removed frames/components (internal state, no observable effect), closed shadow roots and cross-origin frames (out of reach by design), nested frames
  (their own engine handles them; reading aids don't follow into frames of frames).
