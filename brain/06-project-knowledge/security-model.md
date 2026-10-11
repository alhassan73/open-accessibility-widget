# Security Model

> **Load when:** touching input handling, URLs, DOM building, CSP, storage, or release credentials.
> Agent behaviour rules: `04-harness-engineering/tools/safety-guardrails.md`. Review checklist:
> `08-quality-and-evaluation/security-checklist.md`. **Last verified:** 2026-10-11

## 1. Authentication

Not applicable — a client-side library with no accounts, server, or sessions. Release publishing
authenticates through npm Trusted Publishing (OIDC from `release.yml`); no npm token exists in the repo.

## 2. Authorization

Not applicable — no roles. Vulnerability reports go to private GitHub security advisories (`SECURITY.md`).

## 3. Data classification

| Class | Examples | Storage | Logging | Exposure |
| --- | --- | --- | --- | --- |
| Secret | none in the repo | — | Never | Never |
| Visitor preferences (potentially sensitive: may hint at a disability) | Settings, chosen language | Visitor's `localStorage` only | Never | Never leaves the device |
| Public | Source, docs, demo | GitHub, npm | Allowed | Anyone |

## 4. Trust boundaries

- Host page → widget: options (`icon`/`logo` elements, `statementUrl`, theme, labels, numbers) and
  `setSettings` input from arbitrary JS callers.
- `localStorage` / `storage` events → widget (may be tampered or from an older version).
- Host page content → read mode (links, text, images read from the DOM).
- Widget → host page: one injected `<style>` (CSP `nonce`), classes/vars on `<html>`, overlays.

## 5. Threats in scope

| Threat | Mitigation | Where |
| --- | --- | --- |
| XSS through HTML parsing | No `innerHTML`; text nodes via `h()`; SVG via `createElementNS`; works under Trusted Types | `src/widget/dom.ts`, `icons.ts`; e2e Trusted Types test |
| `javascript:` / unsafe URLs | `safeUrl`: http(s), relative and same-scheme only | `src/widget/ui.ts` |
| CSS injection via color values | Hex-only colors (`HEX_COLOR`) | `src/settings.ts` |
| Prototype pollution / bad settings | Copy only known keys; validate types and ranges | `sanitizeSettings`; unit test "never pollutes prototypes" |
| Bad numeric options hiding the launcher | Clamp with `num()` | `src/widget/dom.ts` |
| CSP violations | `nonce` on injected styles; no inline style attributes on host elements | `src/engine/css.ts`, `engine.ts` |
| Untrusted `icon`/`logo` elements | Cloned as-is — documented as caller responsibility | `logoNode`; README options table |
| Supply chain | Zero runtime deps; `npm audit` in CI; provenance on publish | `ci.yml`, `release.yml` |

## 6. Compliance

None for the code itself. Product rule: never claim the widget makes a site compliant (BR-001).
