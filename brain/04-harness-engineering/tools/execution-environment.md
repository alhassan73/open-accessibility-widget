# Execution Environment

> **Load when:** setting up, running the build/tests, or a command fails for environmental reasons. **Rule:** TOOL-6.

**Last verified:** 2026-10-12

## 1. Requirements

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 22 in CI; ≥ 22 needed for e2e (global `WebSocket` in `test/cdp.mjs`) | `node -v` |
| npm | bundled with Node (release workflow installs `npm@^11.5.1` for Trusted Publishing) | `npm -v` |
| Chrome or Edge | any current version, for e2e | found automatically or via `CHROME_PATH` |
| Git Bash (Windows) | for Claude Code hooks | `bash --version` |

OS notes: Windows — hooks run in Git Bash; `.gitattributes` keeps `*.sh` LF (Git for Windows
defaults to `core.autocrlf=true`). `jq` is optional (hooks fall back to `sed`).

## 2. Setup

```
git clone https://github.com/alhassan73/open-accessibility-widget.git
npm install
npm run check        # typecheck → build → size → tests
npm run dev          # docs site + playground on http://localhost:3000 (widget from src/)
```

## 3. Environments

| Env | URL | Data | Agent scope |
| --- | --- | --- | --- |
| local | `npm run dev` (:3000), or `npm run site` + `npx next start` in `examples/` (production headers) | None | Free: build, test, run the docs site |
| CI | GitHub Actions (`ci.yml`, also builds the docs site) | None | Read results only |
| docs + demo (production) | https://open-accessibility-widget.vercel.app/ — Vercel Git integration, Root Directory `examples`, production branch `main` | Public | **Never** deploy, promote or change the Vercel project without approval |
| npm registry (production) | `open-accessibility-widget` — published by `release.yml` on a `v*` tag | Public package | **Never** publish or push tags without approval |

## 4. Configuration

- Env var names and purpose: none used by the library. Tests: `CHROME_PATH` (browser binary,
  optional), `CI` (adds `--no-sandbox`).
- No `.env` files exist or are needed. Adding a variable is an approval gate.

## 5. External services in local/dev

| Service | Local behaviour | Safe to call? |
| --- | --- | --- |
| npm registry | `npm install` / `npm ci` / `npm audit` | Read yes; publish no (TOOL-4) |
| GitHub Actions | Only via workflows | No direct calls |
| Vercel (docs site) | Deploys from `main` (Git integration) | Read yes; deploy only with approval |

## 6. Known environment failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Chrome not found; set CHROME_PATH` | No Chrome/Edge in the standard paths | Set `CHROME_PATH` |
| `Cannot find module '../dist/index.js'` / e2e can't load the bundle | Tests run against `dist/` | `npm run build` first (or `npm run check`) |
| e2e fails on `WebSocket is not defined` | Node < 22 | Use Node 22+ |
| axe test fails with `Cannot find module 'axe-core/axe.min.js'` | devDependencies not installed | `npm ci` |
| `bash .claude/hooks/…` blocked in the agent shell | lean-ctx shell allowlist | Owner runs `lean-ctx allow bash`; hooks themselves are unaffected |
| Hook fails with `$'\r': command not found` | `*.sh` checked out with CRLF | `.gitattributes` `*.sh text eol=lf`, then re-checkout the file |
