# Agent Instructions — open-accessibility-widget

Entry point for every coding agent. Routes to `brain/`. Loads every session — keep it short
and **stable** (unchanged text stays prompt-cached; edit rarely).

## Project snapshot

- Product: framework-agnostic accessibility **preferences** widget (npm `open-accessibility-widget`,
  MIT) for plain JS, React/Next, Vue, Angular, Svelte. It is **not** a compliance tool.
- Stack: TypeScript (strict) · tsup → ESM + CJS + IIFE (`window.A11yWidget`) · zero runtime deps,
  optional React ≥ 18 peer · `node --test` unit + headless-Chrome e2e (CDP, axe-core) · npm · Node 22.
- Gates: `npm run typecheck` · lint: none · `npm run build` · `npm run size` · `npm test` (needs a
  build) · all: `npm run check`

## Route the task before reading anything

- **Small** — 1–2 files, existing pattern, no public-API / storage / dependency / CSS-name impact:
  **fast path** → read the code you change → edit → run the relevant gate → 3-line report.
  Read no brain files.
- **Medium / Large** — read `brain/BRAIN.md` and only the files its row names; read each
  file's `Load when` header first and stop if it doesn't apply.
- **Continuing earlier work** (or the session notice lists in-progress items) — read
  `brain/STATE.md`.
- A `[route]` line added to your prompt names the files for this task — use it instead of browsing.
- Session notice says `unfilled` → run `/brain-init` before feature work.

## Non-negotiables (every task, fast path included)

1. Approval before any gate: dependencies, public API (`src/types.ts`, `src/index.ts`,
   `src/react.ts`), stored-settings format, `a11yw-*` class/variable names, protected paths,
   version/tag/push/publish/deploy (`brain/05-graph-engineering/approval-workflow.md`).
2. Never read, print, or commit secrets. Never trigger real side effects (npm publish, tag push,
   Pages deploy, workflow dispatch).
3. Minimal diff: no drive-by renames, reformatting, or "improvements". Reuse before writing.
4. Never report a check as passing that you did not run. Never weaken a test, the size budget,
   a type setting, or a hook.
5. Medium/Large are done only per `brain/08-quality-and-evaluation/definition-of-done.md`.
6. When a change makes a brain file wrong, fix it in the same change (the Stop hook reminds you).
7. Never claim or imply the widget makes a site compliant (ADA, EAA, EN 301 549, WCAG) — in code,
   labels, docs, or commit text (`README.md` line 11, BR-001).
8. Never add Claude/AI attribution to commits, PRs, or releases: no `Co-Authored-By: Claude`,
   no "Generated with Claude Code". Claude must never appear as a contributor.

## Commands (Claude Code)

`/brain-init` · `/feature` · `/bugfix` · `/refactor` · `/review` · `/brain-sync`

## Output

Terse. Cite rule IDs and `file:line`; never paste unchanged code or narrate searches. Report shape:
`brain/01-prompt-engineering/output-contracts.md`.
