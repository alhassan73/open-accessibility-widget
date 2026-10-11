# Business Rules

> **Load when:** implementing or changing widget behaviour. Rules here are what *should* be true;
> code that disagrees is a bug or an unrecorded decision (`02-context-engineering/source-of-truth.md`).
> **Last verified:** 2026-10-11

## Format

One rule per row. IDs are permanent; retired rules are marked `Retired <date>`, not deleted.
Tests are in `test/widget.e2e.test.mjs` (e2e) or `test/settings.test.mjs` (unit) unless noted.

| ID | Rule (testable statement) | Source | Enforced in | Tests |
| --- | --- | --- | --- | --- |
| BR-001 | The product never claims or implies that it makes a site ADA, EAA, EN 301 549 or WCAG compliant; it offers user preferences. Profiles are not medical tools. | `README.md` l.11, §Profiles; `CONTRIBUTING.md` | Docs, `src/labels.ts` copy | — (gap: review only) |
| BR-002 | No adjustment ever changes the widget itself; adjustments apply to the page only. | `CHANGELOG.md` 1.1.1; README "How it works" | `OUT` selectors in `src/engine/css.ts`; backdrop layer in `src/engine/engine.ts` | "the widget itself is never changed by its own adjustments" |
| BR-003 | `destroy()` removes the widget and undoes every page change (no classes, vars, attributes, or empty `style` left). | README §API; CHANGELOG 1.1.0 | `engine.destroy`, `widget.ts` `destroy` | "destroy() restores the page" |
| BR-004 | With all settings off, the widget does not change the host page's layout or behaviour. | `CONTRIBUTING.md` | `.a11yw-ignore` `display: contents`; rules only under `html.a11yw-*` | "does not change the page layout (grid body)" |
| BR-005 | OS/browser preferences (`prefers-reduced-motion`, `forced-colors`, zoom, default font size) are never overridden and never switch a setting on; color filters are off in forced-colors mode. | README "Preferences and precedence" | `src/engine/css.ts` media queries | "color filters are off in forced-colors mode" |
| BR-006 | Precedence: page as authored < OS settings < `initialSettings` < the visitor's saved choices; "Reset all" returns to the page as authored. | README "Preferences and precedence" | `src/widget.ts` (initial state, `reset`) | "features and initialSettings options" |
| BR-007 | Settings from storage or callers are validated against a fixed schema: unknown keys ignored, ranges clamped, bad values dropped. | `SECURITY.md` | `sanitizeSettings` (`src/settings.ts`) | `settings.test.mjs` sanitize tests |
| BR-008 | A control removed through `features` is not shown and its setting stays off. | README "Removing controls" | `restrict` in `src/widget.ts`; `src/widget/ui.ts` | "features and initialSettings options" |
| BR-009 | Turning a profile on applies its preset; turning it off keeps adjustments the visitor changed afterwards. Unknown profile ids are ignored. | README §Profiles; CHANGELOG 1.1.0 | `toggleProfileSettings` (`src/settings.ts`) | "setSettings({ profiles }) applies the profile presets"; "hostile or careless API use fails safely" |
| BR-010 | Only one widget exists per page; creating another replaces the first. | README §Usage | Registry in `src/widget.ts` | — (gap) |
| BR-011 | Settings persist per visitor (unless `persist: false`) and stay in sync across tabs. | README §Features; CHANGELOG 1.1.0 | `saveSettings`, `storage` listener (`src/widget.ts`) | "settings follow changes made in another tab" |
| BR-012 | Letter spacing is not applied to Arabic and other cursive scripts. | README §Limitations | `CURSIVE` in `src/engine/css.ts` | — (gap) |
| BR-013 | Highlight outlines never hide the keyboard focus indicator. | CHANGELOG 1.1.0 (WCAG 2.4.7) | `:not(:focus-visible)` in `src/engine/css.ts` | "highlight links keeps the focus indicator distinct" |
| BR-014 | The `Alt+A` shortcut never swallows characters typed with it (e.g. macOS Option+A). | CHANGELOG 1.1.0 | `src/widget/ui.ts` | "shortcut never swallows typed characters" |
| BR-015 | Mute media only mutes media that starts on its own; media the visitor plays keeps its sound. | CHANGELOG 1.1.0 | `createMediaControl` (`src/engine/engine.ts`) | "mute media keeps sound the visitor starts themselves" |

## Rules for rules

- Write each rule as a statement a test can check.
- `Source` = who/what decided it. Unknown → `**Assumption:**`.
- `Enforced in` = the one place the rule lives in code. Several places = a finding (duplicated rule).
- `Tests: — (gap)` is allowed but is reported as a risk.
- Feature docs reference rules by ID; they never restate them.
