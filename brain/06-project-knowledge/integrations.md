# Integrations

> **Load when:** calling, changing, or debugging an external service (build, test, release, demo).
> **Last verified:** 2026-10-11

## 1. Services

The library itself calls **no** external service at runtime (no network requests — `SECURITY.md`, P-5).
Only tooling does:

| Service | Purpose | Called from | Adapter (only entry point) | Auth (name of secret, never value) | Sandbox? |
| --- | --- | --- | --- | --- | --- |
| npm registry | Install deps; publish releases | `npm ci` (CI), `release.yml` | `npm publish --access public` | npm Trusted Publishing (OIDC `id-token: write`) — no token | No |
| GitHub Pages | Host the live demo | `pages.yml` on push to `main` | `actions/deploy-pages` | `GITHUB_TOKEN` scopes `pages`, `id-token` | No |
| Dependabot | Weekly update PRs: npm devDeps + SHA-pinned actions | `.github/dependabot.yml` | GitHub | none | n/a |
| jsDelivr / unpkg | Serve the IIFE build to `<script>` users | Consumers | `unpkg` / `jsdelivr` fields in `package.json` | none | n/a (mirror npm) |

## 2. Contracts

### npm registry (release)

- Trigger: push of tag `vX.Y.Z`; the tag must equal `v` + `package.json` version, otherwise the job fails.
- Versions already on npm are skipped. `prepublishOnly` runs `npm run check`. Provenance attached.
- One-time setup lives on npmjs.com (Trusted Publisher: GitHub Actions, `alhassan73/open-accessibility-widget`, `release.yml`).

### GitHub Pages (demo)

- Builds, copies `dist/open-accessibility-widget.global.js` and `examples/index.html` (path rewritten) into `_site/`.

## 3. Rules

- Never trigger a release or deploy (tag push, `npm publish`, workflow dispatch) without approval (TOOL-4).
- Adding a runtime network call is an approval gate (P-5); adding any new service = ARCH-3 gate.
- Tests must not depend on a network service to pass; a skipped network-dependent test is reported as `not run`.
