# System Architecture

> **Load when:** a change crosses modules, touches build/release, or needs the invariants.
> Rules for changing it: `04-harness-engineering/architecture/`. **Last verified:** 2026-10-11

## 1. Overview

```
 host page ── init(options) / <AccessibilityWidget> / A11yWidget.init
      │
      ▼
 src/widget.ts  (registry · state · storage · cross-tab sync)
   ├─► src/widget/ui.ts ── panel DOM inside .a11yw-ignore ── UiApi events ─┐
   ├─► src/engine/engine.ts ── <html> classes + --a11yw-* vars, font       │
   │      scaler, pointer tools, backdrop filter, media control            │
   │      └─ src/engine/css.ts (one <style>, CSP nonce)                     │
   └─► localStorage (a11yw-settings, :lang)  ◄──────────────────────────────┘
 src/settings.ts (schema/validation) · src/types.ts · src/labels.ts (en/ar)
```

A dependency-free browser library written in TypeScript and bundled by tsup into ESM + CJS (+ `.d.ts`)
for bundlers and an IIFE (`window.A11yWidget`) for `<script>` tags. All page changes are CSS classes
and custom properties on `<html>` driven by one injected stylesheet; the widget UI lives in a
`display: contents` wrapper that every adjustment skips. Distribution: npm (+ jsDelivr/unpkg);
demo on GitHub Pages.

## 2. Components

| Component | Tech | Responsibility | Runs where |
| --- | --- | --- | --- |
| Core (`index.ts` and below) | TypeScript → ESM/CJS/IIFE | Widget, engine, settings | Visitor's browser |
| React adapter (`react.ts`) | React ≥ 18, `"use client"` banner | Component + `useAccessibility` hook | Browser (renders `null` on server) |
| Docs site (`examples/`) | Next.js 16 App Router, next-intl (en/ar), widget from `src/` via tsconfig paths | Docs, search, live playground (`widget.setOptions`) | Vercel |
| CI / release (`.github/workflows/`) | GitHub Actions, Node 22 | Gates (incl. docs build), npm publish | GitHub |

Module ownership inside the codebase: `04-harness-engineering/architecture/module-boundaries.md`.

## 3. Storage

| Store | Holds | Lifetime | Never holds |
| --- | --- | --- | --- |
| `localStorage[storageKey]` (default `a11yw-settings`) | `{ v: 1, …settings }`; removed when settings equal defaults | Until the visitor clears it | Anything but settings |
| `localStorage[storageKey + ":lang"]` | Chosen language code | Same | — |
| `globalThis[Symbol.for("a11yw.registry")]` | Active instance + listeners | Page lifetime | — |

## 4. Runtime behaviour

- Lifecycle: `init()` → destroys any previous instance → loads settings → engine applies → UI builds →
  registry set. `destroy()` reverses everything.
- Background work: MutationObservers re-apply `<html>` flags wiped by frameworks and re-attach after
  `<body>` swaps (Turbo, htmx, Astro); font scaler measures new content as it appears.
- Caching: font sizes measured once per element (`data-a11yw-fs`), not re-measured on height-only resizes.

## 5. Deployment

- Hosting: npm registry + CDNs (package), Vercel (docs site, production from `main`) · Pipeline:
  `ci.yml` on PRs and pushes to `main`/version branches; `release.yml` on `v*` tags.
  Environments: `04-harness-engineering/tools/execution-environment.md`.

## 6. Invariants (ARCH-6)

Must always be true. Breaking one requires an ADR.

1. The widget is never changed by its own adjustments (BR-002).
2. `destroy()` restores the page exactly; off = no layout or behaviour change (BR-003, BR-004).
3. No HTML is parsed from strings; the widget runs under Trusted Types (P-2).
4. Zero runtime dependencies and no network requests (P-5).
5. One widget per page, shared across duplicate package copies via the `globalThis` registry (BR-010).
6. Every input from callers or storage is sanitized before use (BR-007).
7. The IIFE bundle stays within the gzip budget (P-6).

## 7. Known system-level issues

| ID | Issue | Impact | Workaround / plan |
| --- | --- | --- | --- |
| KI-001 | Adjustments don't reach `<iframe>` or Shadow DOM content | Embedded media/maps/forms and web components are unchanged | Documented in README §Limitations |
| KI-002 | "Page zoom" uses CSS `zoom`, which doesn't trigger media queries | Layouts may not reflow | Suggest browser zoom in the statement (README) |
| KI-003 | Stop animations doesn't stop GIFs, `<canvas>`, iframe video, or JS-driven animation | Some motion remains | Documented in README §Profiles |
