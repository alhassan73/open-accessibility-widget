# Dependency Management (third-party)

> **Load when:** a task seems to need a package, or touching `package.json` / `package-lock.json`. **Rule:** TOOL-2 [G].

**Last verified:** 2026-10-11

## 1. Before proposing a dependency

Walk the reuse ladder (`../coding/code-patterns.md` §1). **Runtime dependencies: none, by design**
(README, CONTRIBUTING, P-5) — a runtime dependency is effectively never accepted. Dev dependencies
need a request stating:

| Field | Content |
| --- | --- |
| Need | What it does that existing code/deps can't, in one line |
| Candidate | Name, version, license |
| Health | Last release date, maintenance, weekly downloads/stars, open security advisories |
| Cost | Install size, transitive deps; confirm it never reaches `dist/` |
| Alternative | The no-dependency option and why it's worse |

## 2. Rules

- Package manager: npm only (`package-lock.json`). Never mix lockfiles.
- Install with npm; never hand-edit the lockfile. CI uses `npm ci`.
- Pin policy: caret ranges (`^`) in `devDependencies` (observed in `package.json`).
- Allowed licenses: **Open question:** — default MIT, ISC, BSD-2/3-Clause, Apache-2.0.
- `react` stays an **optional peer** (`>=18`) and `external` in `tsup.config.ts`; it is a dev
  dependency only for the adapter's types/build.
- Upgrades: one package (or coupled family) per change; read the changelog; run `npm run check`.
- CI fails on `npm audit` advisories of moderate or higher.
- Removing a dep: search for every import first; remove config/types that came with it.

## 3. Pinned / held-back packages

| Package | Held at | Why | Revisit when |
| --- | --- | --- | --- |
| `axe-core` (dev) | `^4.14.0` | Approved 2026-10-11 (compliance review P0-3): the a11y e2e test loads it from `node_modules`. License MPL-2.0 — test-only, never in `dist/` | Dependabot PRs; a new major |
| Docs-site deps (`examples/package.json`: next 16, react 19, next-intl 4, radix-ui, tailwindcss 4, lucide-react, simple-icons, cva, clsx, tailwind-merge, tw-animate-css, @fontsource/*) | caret ranges | Approved 2026-10-12 (docs site): workspace `examples` only, never in `dist/` or the npm tarball (`files: ["dist", …]`). `@fontsource/almarai` also feeds `npm run banner` | Dependabot PRs; a Next major |
| `esbuild` (via `overrides`) | `^0.28.2` | **Open question:** added in 11e58d7 (1.1.0) without a recorded reason. **Assumption:** forces a version without an `npm audit` advisory under tsup | tsup's own esbuild range reaches ≥ 0.28.2 |
