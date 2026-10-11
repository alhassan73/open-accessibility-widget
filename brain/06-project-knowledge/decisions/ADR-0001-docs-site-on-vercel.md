# ADR-0001: Docs site as a Next.js workspace on Vercel

- **Status:** Accepted
- **Date:** 2026-10-12
- **Deciders:** owner (alhassan73)
- **Related:** F-014, BR-001

## Context

The demo was one static `examples/index.html` deployed to GitHub Pages by `pages.yml`. The project needed
real documentation (frameworks, guides, API) in English and Arabic, matching the owner's open-wysiwyg-editor
docs, without adding anything to the published package.

## Options

1. **Next.js App Router workspace in `examples/`, deployed by Vercel** — prerendered pages, a proxy for
   language redirects, real response headers (CSP, HSTS); reuses the wysiwyg site's components / needs a
   Vercel project and workspace dependencies.
2. **Same app as a static export on GitHub Pages** — no new host / base path, CSP only via `<meta>` with
   script hashes, a root language-chooser page, no redirects.
3. **Keep the single HTML demo** — no build / no docs, no Arabic pages, no search.

## Decision

We will build the docs in `examples/` as an npm workspace (Next.js App Router, next-intl en/ar) that imports
the widget from `src/`, deploy it with Vercel's Git integration (Root Directory `examples`, production from
`main`), and remove `pages.yml` and `examples/index.html`.

## Consequences

- Positive: docs ship with every widget change (CI builds them); the site dogfoods the React entry;
  security headers are real HTTP headers.
- Negative / accepted costs: `npm install` also installs the site; production deploys happen outside
  GitHub Actions (Vercel dashboard); `script-src 'unsafe-inline'` for prerendered pages (Trusted Types
  still enforced).
- Follow-ups: owner imports the repo in Vercel and disables Pages.
- Revisit when: a custom domain is chosen (add HSTS `preload` then), or Vercel stops fitting.
