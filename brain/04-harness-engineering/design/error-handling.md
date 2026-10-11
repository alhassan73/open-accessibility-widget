# Error Handling

> **Load when:** writing a failure path, catching an error, or adding logging. **Rules:** DES-4, STD-4.

**Last verified:** 2026-10-11

## 1. Classify

| Class | Example in this library | Handling |
| --- | --- | --- |
| Bad input from callers / storage | Invalid settings, unknown profile id, NaN `zIndex`, `javascript:` URL | Ignore or clamp silently: `sanitizeSettings`, `num()`, `safeUrl()` |
| Unavailable platform feature | `localStorage` blocked (private mode, quota) | `try/catch` around storage; the setting still applies to this page view |
| Consumer code throws | `onChange` / `subscribe` listener error | `safely()` → `console.error` with prefix; widget state stays consistent |
| Programmer error | `init()` called without `window`/`document` (SSR) | Throw `Error("[open-accessibility-widget] …")` with the fix in the message |
| Misconfiguration worth telling the developer | Theme colors below WCAG contrast | `console.warn` with prefix, never throw (`warnOnLowContrast`) |

## 2. Rules

- Catch only where you can **act**: recover, retry, translate, or report. Otherwise let it propagate.
- Never swallow silently except where degrading is the documented behaviour (storage, invalid
  input) — and then leave a comment saying why.
- The host page must never break because of the widget: consumer callbacks run through `safely()`.
- Messages are for developers; visitors never see errors.
- Only handle conditions the system can actually produce — no speculative handling.
- API error shape / HTTP translation: not applicable — no network or server.

## 3. Logging

- No logger module: `console.error` / `console.warn` only, always prefixed
  `[open-accessibility-widget]`, only for the cases in §1. No debug output in committed code (CODE-8).
- Never log visitor settings or page content.
