# Code Patterns

> **Load when:** writing code that does something the codebase already does somewhere. **Rule:** CODE-3.
> Reuse beats rewrite. This is the index of "the way we do X here".

## 1. Reuse ladder (stop at the first that applies)

1. **Skip** — is it needed at all? (YAGNI)
2. **Reuse** — does the codebase already provide it? (search §2, then the code)
3. **Standard library** of the language/runtime.
4. **Platform/framework built-in** (CSS over JS where it works).
5. **An already-installed dependency** — none at runtime; dev-only deps never ship.
6. **Minimum new code** — a new runtime dependency is off the table without approval (P-5, TOOL-2).

## 2. Pattern index

| Need | Use | Location | Don't |
| --- | --- | --- | --- |
| Create DOM | `h(tag, props, ...children)` | `src/widget/dom.ts` | `innerHTML`, `insertAdjacentHTML`, `outerHTML =` |
| Icon | `icon(name)` (createElementNS) | `src/widget/icons.ts` | SVG markup strings |
| Unique element id | `uid(prefix)` | `src/widget/dom.ts` | Hard-coded ids |
| Clamp a numeric option from JS callers | `num(value, min, max, fallback)` | `src/widget/dom.ts` | Trusting caller numbers |
| Focus trap / focusables | `trapTab`, `focusableIn`, `FOCUSABLE` | `src/widget/dom.ts` | New trap logic |
| User logo / icon option | `logoNode(source)` | `src/widget/dom.ts` | Inserting caller elements uncloned |
| Validate settings (storage, callers) | `sanitizeSettings(input)` | `src/settings.ts` | Casting `JSON.parse` output |
| Merge / profile toggle | `mergeSettings`, `toggleProfileSettings` | `src/settings.ts` | Ad-hoc object spreads of settings |
| WCAG contrast ratio of two hex colors | `contrast(a, b)` | `src/settings.ts` | A second luminance formula |
| Apply a page adjustment | `flag(name, value)` / `setVar(name, value)` | `src/engine/engine.ts` | Inline styles on host elements |
| CSS that must skip the widget | append `OUT` to selectors | `src/engine/css.ts` | Bare selectors that reach `.a11yw-ignore` |
| Safe link / URL | `safeUrl(url)` | `src/widget/ui.ts` | Raw `href` from options or page content |
| Call consumer callbacks | `safely(fn)` | `src/widget.ts` | Letting `onChange`/listeners throw into the widget |
| Storage access | `readStorage` / `writeStorage` / `loadSettings` / `saveSettings` | `src/widget.ts` | Direct `localStorage` calls without try/catch |
| Find the live instance | `getAccessibilityWidget`, `onActiveWidgetChange` | `src/widget.ts` | Module-level instance variables |
| Test page + browser | `fixture`, `launchBrowser`, `KEYS` | `test/cdp.mjs` | New browser drivers / dependencies |

## 3. Rules

- Before writing a helper, search for its likely names and for call sites doing the same thing.
- Extract a shared helper only with ≥ 2 call sites now; the third copy is the latest you wait.
- When you add a reusable pattern, add a row here in the same change.
