# Glossary

> **Load when:** a term is ambiguous, or naming something new. Use these terms exactly in code,
> docs, and UI copy. **Last verified:** 2026-10-11

| Term | Meaning | In code as | Not to be confused with |
| --- | --- | --- | --- |
| Widget | The whole thing a site mounts: launcher + panel + page engine | `createAccessibilityWidget` / `init` | Panel |
| Launcher | The floating button that opens the panel | `.a11yw-launcher` | — |
| Panel | The dialog with profiles and settings | `.a11yw-panel`, `src/widget/ui.ts` | Widget |
| Adjustment / setting | One visitor preference applied to the page | key of `AccessibilitySettings` | Option |
| Option | Site owner configuration passed to `init` | `AccessibilityWidgetOptions` | Setting |
| Profile | Preset that switches on several adjustments | `ProfileId`, `PROFILE_PRESETS` | Medical/compliance mode (never) |
| Feature (control) | A control the owner can remove via `features` | `FeatureKey` | Product feature in `feature-registry.md` |
| Engine | Code that applies settings to the host page | `src/engine/engine.ts` | UI |
| Host page | The site the widget is embedded in | `document` outside `.a11yw-ignore` | Widget |
| Ignore root | Wrapper that holds the widget and that adjustments skip | `.a11yw-ignore` (`display: contents`) | — |
| Backdrop layer | Page-wide `backdrop-filter` element below the widget that applies contrast/saturation | `createBackdrop` | Filter on `<html>` (old, pre-1.1.1) |
| Read mode | Text-only reading view of the page | `src/widget/ui.ts` (`a11yw-reader-*`) | Screen reader |
| Pointer tools | Reading line (guide), focus window (mask), text magnifier | `createPointerTools` | — |
| Statement | The site's accessibility statement link | `statementUrl` | Compliance claim |
| RTL | Right-to-left languages (Arabic built in) | `dir`, `RTL_LANGUAGES` | — |

## Rules

- One concept, one term. Synonyms in code (`client` vs `customer`) are a finding.
- If the business term and the code name differ, record both here; don't rename without a task.
- Abbreviations are listed here or not used: `a11yw` = accessibility widget (CSS/storage prefix).
