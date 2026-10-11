---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/test/**"
  - "**/tests/**"
  - "**/__tests__/**"
---

# Test files (auto-loaded only when these paths are touched)

- Never delete, skip, or loosen an assertion to get green (ENF-2); snapshot updates need a read diff.
- Deterministic: control time, randomness, network. No real side effects (TOOL-4).
- One test per acceptance criterion + main error path; bug fixes start with a failing test.
- Tests import `dist/` — run `npm run build` first. e2e uses `test/cdp.mjs` (no new browser
  dependencies); it needs Chrome/Edge (`CHROME_PATH`). A skipped axe test is "not run", not a pass.
- Details: `brain/03-loop-engineering/testing-loop.md`.
