# Integrations

> **Load when:** calling, changing, or debugging an external service (build, test, release, demo).
> **Last verified:** 2026-10-12

## 1. Services

The library itself calls **no** external service at runtime (no network requests — `SECURITY.md`, P-5).
Only tooling does:

| Service | Purpose | Called from | Adapter (only entry point) | Auth (name of secret, never value) | Sandbox? |
| --- | --- | --- | --- | --- | --- |
| npm registry | Install deps; publish releases | `npm ci` (CI), `release.yml` | `npm publish --access public` | npm Trusted Publishing (OIDC `id-token: write`) — no token | No |
| Vercel | Host the docs site + live demo (`examples/`) | Vercel Git integration on push (preview per branch, production from `main`) | Vercel project settings (Root Directory `examples`) + `examples/vercel.json` | Vercel account of the owner — no secret in the repo | Preview deployments |
| Dependabot | Weekly update PRs: npm devDeps + SHA-pinned actions | `.github/dependabot.yml` | GitHub | none | n/a |
| jsDelivr / unpkg | Serve the IIFE build to `<script>` users | Consumers | `unpkg` / `jsdelivr` fields in `package.json` | none | n/a (mirror npm) |

## 2. Contracts

### npm registry (release)

- Trigger: push of tag `vX.Y.Z`; the tag must equal `v` + `package.json` version, otherwise the job fails.
- Versions already on npm are skipped. `prepublishOnly` runs `npm run check`. Provenance attached.
- One-time setup lives on npmjs.com (Trusted Publisher: GitHub Actions, `alhassan73/open-accessibility-widget`, `release.yml`).

### Vercel (docs site)

- Builds `examples/` with `next build`. `examples/vercel.json` installs with `cd .. && npm ci` (the whole
  workspace from the root lockfile; Vercel's default installed only the workspace's own deps, so `typescript`
  was missing). The site reads `../src` and `../CHANGELOG.md`, so files outside the Root Directory must stay
  included (Vercel's default).
- Pages are prerendered; `src/proxy.ts` only redirects `/` (and paths without a language) to `/en/` or `/ar/`.
- Security headers (CSP with Trusted Types, HSTS, frame-ancestors) come from `next.config.ts`, production only.
- Project `open-accessibility-widget` (team `alhassan73s-projects`, Hobby), created 2026-10-12 with the CLI:
  Root Directory `examples`, Node 22.x, Git-connected (production from `main`). Only `vercel.json` is in
  the repo; no token. `vercel link` writes `.vercel/` and a pulled env file — both git-ignored.

## 3. Rules

- Never trigger a release or deploy (tag push, `npm publish`, workflow dispatch) without approval (TOOL-4).
- Adding a runtime network call is an approval gate (P-5); adding any new service = ARCH-3 gate.
- Tests must not depend on a network service to pass; a skipped network-dependent test is reported as `not run`.
