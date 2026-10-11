# Product Overview

> **Load when:** a task needs product intent — who it's for, what matters, what's out of scope.
> **Last verified:** 2026-10-11

## What it is

An open-source (MIT) accessibility **preferences** menu that any website can embed — plain HTML/JS,
React, Next.js, Vue, Nuxt, Angular, Svelte, Astro, WordPress. Visitors adjust text, color, reading
aids, motion and navigation to their needs; the widget saves their choices. It has no runtime
dependencies, ships TypeScript types, supports RTL/Arabic, and is themable. It does **not** make a
site compliant (BR-001).

## Users

| Persona / role | Goal | Key journeys |
| --- | --- | --- |
| Site visitor | Adjust the page to their needs | Open with launcher or `Alt+A` → pick a profile or adjustments → choices persist |
| Site owner / developer | Offer preferences without breaking their site | `npm install` or `<script>` → `init(options)` → theme, languages, features |
| Keyboard / screen-reader user | Operate the widget itself | Skip link, dialog with focus trap, announced controls |

## Goals and success measures

| Goal | Measure |
| --- | --- |
| The widget's own UI is accessible | axe-core: no violations; keyboard e2e passes (`npm test`) |
| Host pages are never broken | Host-safety e2e tests pass (layout, focus, CSP, re-renders, `<body>` swaps, `destroy()`) |
| Small and dependency-free | IIFE ≤ 22 KB gzip (`npm run size`); `dependencies` empty |

## Scope

- **In scope:** user-preference adjustments applied with CSS on the host page; profiles; read mode;
  theming; languages (en, ar, custom); persistence; framework adapters (React).
- **Out of scope (deliberately):** fixing a site's markup, compliance claims or "overlays" that
  promise compliance, iframes and Shadow DOM content, network services, analytics.

## Feature map

High-level capabilities → `07-feature-documentation/feature-registry.md` for the full list.

- Quick profiles · Text · Color · Reading aids · Motion & navigation · Read mode
- Built-ins: reset, statement link, hide widget, language menu, skip link, `Alt+A`, saved settings
- Distribution: ESM/CJS, React adapter, `<script>` build, live demo

## Constraints

- Business/legal/regulatory: never marketed as a compliance solution (README l.11); MIT license.
- Markets / languages: English and Arabic (RTL) built in; custom languages via options.
- Release cadence: no fixed cadence recorded; semver releases 1.0.0 → 1.1.1 (`CHANGELOG.md`).
