# Compatibility

> **Load when:** changing the public API, stored format, or using a newer platform API. **Rule:** STD-5.

**Last verified:** 2026-10-11

## Support matrix

| Target | Supported | Notes |
| --- | --- | --- |
| Browsers | Chrome / Edge 120+, Firefox 126+, Safari 16.4+ (desktop and mobile) get every feature | Older versions degrade feature by feature (README "Browser support") |
| Mobile OS / devices | iOS/iPadOS Safari 16.4+, Android Chrome 120+ | Pointer tools move only with focus on touch screens |
| Build output | es2019 (`tsup.config.ts`); types checked against ES2020 + DOM | |
| Dev/CI runtime | Node 22 | Not a runtime dependency of consumers |
| Frameworks | Any; React adapter needs `react` ≥ 18 (optional peer); Next.js App Router via `"use client"` | |
| Database | Not applicable | |
| API consumers | npm users (ESM `import`, CJS `require`, `.d.ts`/`.d.cts`) and `<script>` users (`window.A11yWidget`, CDN `@1` URLs) | |

## Rules

- Platform APIs: check support for the matrix before use; guard and degrade (e.g. CSS `zoom`,
  `navigator.userActivation`).
- Versioning: semver (`CHANGELOG.md`). Additive options/exports → minor; fixes → patch.
- Removing/renaming exports, options, settings keys, profile ids, `a11yw-*` names, or changing
  semantics is breaking (ARCH-4). Profile ids stay even when visible names change.
- Breaking change → next major only. Deprecation window: **Open question:** — default: deprecate in
  a minor with a CHANGELOG note, remove in the next major.
- Stored data lives forever: a changed stored format bumps `STORAGE_VERSION` and handles old data.
- CDN users pin `@1`: never ship a breaking change in a 1.x release.
