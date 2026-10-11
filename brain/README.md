# Brain — User Guide

The **brain** is a drop-in operating system for AI-assisted development. Copy it into any project
and every coding agent (Claude Code, Codex, Cursor, Copilot, Gemini) gets:

- **One entry point** — `AGENTS.md` — that routes each task to exactly the files it needs.
- **A knowledge base** of your product, architecture, rules, and features that the agent reads on
  demand instead of re-discovering the codebase every session.
- **Workflows with approval gates** for features, bugs, and refactors.
- **A harness** — rules the code and the agent must obey, some enforced mechanically by hooks.
- **Token economy** — small tasks read almost nothing; large tasks read only what their route names.

> This file is for humans. Agents never load it — they start at `AGENTS.md`.

---

## Contents

1. [What ships](#1-what-ships)
2. [How it works](#2-how-it-works)
3. [Install](#3-install)
4. [Initialize with `/brain-init`](#4-initialize-with-brain-init)
5. [Daily use](#5-daily-use)
6. [Approvals](#6-approvals)
7. [Keeping the brain true](#7-keeping-the-brain-true)
8. [Saving tokens — your habits](#8-saving-tokens--your-habits)
9. [Using other agents](#9-using-other-agents)
10. [Customize](#10-customize)
11. [Enforced vs instructed](#11-enforced-vs-instructed)
12. [Troubleshooting](#12-troubleshooting)
13. [Folder reference](#13-folder-reference)

---

## 1. What ships

```
install.sh                   Template only (not copied): installs into a project's main working tree
AGENTS.md                    Entry point for all agents (~40 lines, loaded every session)
CLAUDE.md                    "@AGENTS.md" — Claude Code imports the same entry point
.claude/
  settings.json              Permissions (allow / ask / deny) + hook wiring
  hooks/
    guard-bash.sh            Before every shell command: blocks destructive/secret commands, asks on risky ones
    route.sh                 On every prompt: adds a one-line [route] naming the 1–3 brain files to read
    brain-check.sh           Session start: short status notice. Manual/CI: full health check
    sync-check.sh            End of a turn: if code changed, asks for a targeted brain update
  commands/                  /brain-init /feature /bugfix /refactor /review /brain-sync
  agents/
    context-scout.md         Read-only explorer on a cheap model — wide searches stay out of your context
    reviewer.md              Independent read-only reviewer for /review and Large changes
  rules/                     Rules that auto-load only when matching files are touched (ui, api, data, tests, brain)
brain/
  BRAIN.md                   Router: task → files to read (~40 lines)
  STATE.md                   Working memory: goal, in progress, open questions, handoff
  README.md                  This guide
  01 … 10/                   The layers (see §13)
```

---

## 2. How it works

### A session, step by step

```
You open Claude Code
  └─ SessionStart hook ── brain-check.sh --session
       prints:  [brain] STATE 2026-10-09 · goal: Ship checkout v2
                [brain] in progress: Payment form validation
You type a prompt: "fix the login bug on mobile"
  └─ UserPromptSubmit hook ── route.sh
       adds:    [route] … read only: 05-graph-engineering/bugfix-workflow.md, 03-loop-engineering/debugging-loop.md
                        | 06-project-knowledge/security-model.md, …
The agent (following AGENTS.md):
  ├─ classifies the task: Small / Medium / Large
  ├─ Small  → fast path: read the code, edit, run the check, 3-line report. No brain files.
  └─ Medium / Large → reads the routed files (header first) → follows the workflow
       ├─ every shell command passes guard-bash.sh (deny / ask / allow)
       ├─ editing ui/api/test files auto-loads the matching .claude/rules file
       ├─ wide searches are delegated to context-scout
       └─ approval gates stop and ask you
The agent finishes its turn
  └─ Stop hook ── sync-check.sh
       code changed? → "update STATE.md + only the affected brain files, or say 'Brain: no impact'"
```

### Task sizes

The agent classifies every task before reading anything. When in doubt it sizes up.

| Size | Looks like | What the agent does |
| --- | --- | --- |
| **Small** | 1–2 files, existing pattern, no contract/data/auth/dependency change. A typo, a label, a style fix. | Fast path: read the code → edit → run the relevant check → short report. |
| **Medium** | Several files or a real behaviour change inside one module. | Context pack → short plan → implement in green increments → all gates → self-review → brain sync → report. |
| **Large** | Cross-module; touches an API, database, auth, payments, SEO, infra, production; or hits any approval gate. | Spec → impact analysis → **your approval** → increments → gates → independent review → sync → report. |

### What the agent loads

| Situation | Loaded |
| --- | --- |
| Every session | `AGENTS.md` (cached), the 1–3 line session notice |
| Every prompt | One `[route]` line (or nothing if no keyword matches) |
| Small task | Only the code it changes |
| Medium / Large | + `BRAIN.md`, the routed files, the rulebook digest (`04-harness-engineering/README.md`) |
| Continuing earlier work | + `STATE.md` |
| Touching UI / API / data / tests | + the matching `.claude/rules/*.md` (a few lines) |

---

## 3. Install

### Where it goes

Into the repository's **main working-tree root** — the parent of
`git rev-parse --path-format=absolute --git-common-dir` (also the first entry of `git worktree list`).
Never into a linked worktree (e.g. Claude Code's `.claude/worktrees/<agent>/`): those are temporary,
and anything written there is lost or committed to the wrong branch.

### New project

From Git Bash (Windows) or any POSIX shell:

```
sh /path/to/agent-brain-template/install.sh /path/to/project
```

`install.sh` resolves the main working-tree root (and refuses a linked worktree, telling you the
right path), refuses to overwrite an existing `CLAUDE.md`, `AGENTS.md`, `brain/` or
`.claude/{settings.json,hooks,agents,commands,rules}` unless you pass `--force`, copies
`AGENTS.md  CLAUDE.md  .claude/  brain/`, strips CR from the hook scripts, and appends
`*.sh text eol=lf` to `.gitattributes` and `.claude/worktrees/` to `.gitignore` when missing.
Copying by hand works too — then add those two lines yourself.

Requirements: Claude Code; Git Bash on Windows (Claude Code already requires it) or any POSIX shell
on macOS/Linux; git (for the end-of-turn sync check). `jq` is optional — the hooks fall back to
`sed`. On Windows keep `*.sh` LF (`.gitattributes` above): with `core.autocrlf=true` a CRLF
checkout breaks every hook with `$'\r': command not found`.

### Existing project

| You already have | Do this |
| --- | --- |
| `AGENTS.md` | Keep your project-specific lines; add this file's sections (route, non-negotiables, commands, output). |
| `CLAUDE.md` | Move its content into `AGENTS.md`, then make `CLAUDE.md` contain only `@AGENTS.md`. |
| `.claude/settings.json` | Merge: append the `permissions.allow/ask/deny` entries and the four `hooks` events. |
| `.claude/commands`, `agents`, `rules` | Copy alongside yours; rename on a name clash. |
| Docs folder (`docs/`, `context/`) | Leave it. `/brain-init` reads it and moves facts into the brain; delete the old folder later if you want. |

**Next.js note:** `next dev` writes its own block into `AGENTS.md`. Keep it — the agent needs it.
If `brain-check.sh` then reports `AGENTS.md` over budget, raise the limit in `brain-check.sh`
(`budget AGENTS.md 60`) and in rule `CTX-6`.

---

## 4. Initialize with `/brain-init`

Run once per project, in Claude Code:

```
/brain-init
/brain-init Monorepo; the web app is apps/web. Staging is shared with QA — read-only.
```

What happens:

1. The `context-scout` subagent scans manifests, configs, folder tree, README, CI, entry points,
   tests, `.env.example`, and git history. It never reads secrets.
2. The agent fills every double-brace placeholder it can **verify** — commands, stack, module
   boundaries, patterns, integrations, standards, the `.claude/rules` globs.
3. Anything it can't verify becomes `**Open question:**` (copied to `STATE.md`) or
   `Not applicable — <reason>`. It never invents.
4. Features it finds are registered in `07-feature-documentation/feature-registry.md` as
   `existing — undocumented`.
5. It runs `brain-check.sh` and reports: files filled, plus one batch of questions, each with a
   recommended default.

**Your part:**

1. Answer the questions (or accept the defaults). The agent fills the rest.
2. Review the `brain/` diff like code — this is what every future session will trust.
3. Commit it.
4. Optional: tune the harness for your project (§10).

The session notice shows `unfilled: N slots` until initialization is complete.

---

## 5. Daily use

### Slash commands (Claude Code)

| Command | Use for | Example |
| --- | --- | --- |
| `/feature <desc>` | New or changed behaviour | `/feature Users can export invoices as CSV from the invoices list` |
| `/bugfix <desc>` | Something behaves wrongly | `/bugfix Login button does nothing on iOS Safari; expected redirect to /dashboard` |
| `/refactor <desc>` | Restructure with zero behaviour change | `/refactor Split OrderService into pricing and fulfilment modules` |
| `/review [target]` | Independent review of your diff, a branch, or a PR | `/review` · `/review feature/csv-export` |
| `/brain-sync [scope]` | Brain drifted from the code | `/brain-sync since v1.4` · `/brain-sync auth` |
| `/brain-init [notes]` | First setup, or after a big restructure | `/brain-init` |

### Plain prompts work too

You don't need a command. "fix the date format on the invoice page" gets routed automatically, and
the agent picks the workflow. Commands just make the workflow explicit.

### Writing good prompts

Use the templates in `01-prompt-engineering/prompt-templates.md`. The short version:

```
Feature: CSV export for invoices
Outcome: users download the current filtered invoice list as CSV
Acceptance: 1) respects active filters 2) empty list → header-only file 3) only admins see the button
Out of scope: PDF export
Similar to: the orders export in src/orders/export
```

Outcome + acceptance criteria + out of scope + "similar to" saves the agent most of its searching.

### What you will see

| Message | Meaning | Your action |
| --- | --- | --- |
| `[brain] unfilled: N slots …` | Brain not initialized | Run `/brain-init` |
| `[brain] in progress: …` | Earlier work is unfinished | Say "continue" or start something else |
| `[brain] stale: <file>` | A knowledge file wasn't verified for 90+ days | Run `/brain-sync <area>` when convenient |
| `[route] …` | Files picked for your prompt | Nothing — it's for the agent |
| **Approval needed: …** | The agent hit a gate | Answer yes / no / modify (§6) |
| Blocked: "Force-push is blocked (TOOL-3)…" | The guard stopped a command | Run it yourself if you really mean it |
| A permission prompt for `git push`, `npm install`, … | Ask-tier action | Approve or deny |
| "Brain sync check — code changed …" | End-of-turn reminder (the agent handles it) | Nothing |

### Final reports

Every task ends with a fixed-shape report: **Done**, **Changed**, **Verified** (actual commands),
**Not verified**, **Assumptions**, **Risks**, **Brain updated**. If something says "not run", it
wasn't — the brain forbids claiming checks that didn't happen.

---

## 6. Approvals

The agent plans freely but **stops and asks** before:

- adding, removing, or upgrading a dependency
- a new module, layer, pattern, or framework (an ADR is drafted for you)
- changing a public contract — API shape, DB schema, events, routes/URLs, config keys
- data migrations or any change to stored data
- adding an environment variable or secret
- auth, permissions, crypto, sessions
- editing protected files (the harness, CI, lockfiles, applied migrations)
- removing user-visible behaviour
- push, merge, rebase, deploy, publish
- anything with real-world side effects (emails, payments, production writes)

A request looks like:

```
Approval needed: dependency
Change: add `papaparse` for CSV generation
Why: … · Impact: … · Risk: … · Rollback: … · Alternatives: …
Proceed? (yes / no / modify)
```

Rules: approval covers **exactly** what was described, for this task only. "Do whatever you think"
never approves Never-tier actions (secrets, force-push, production writes). A "no" is final — the
agent won't reach the same outcome by another route.

Add project-specific gates in `05-graph-engineering/approval-workflow.md` §1.

---

## 7. Keeping the brain true

A wrong brain costs more than no brain — the agent acts on bad facts and redoes the work. Four
mechanisms keep it honest:

| Mechanism | When | What it does |
| --- | --- | --- |
| Same-change rule | Every task | A change that makes a brain file wrong fixes it in the same change. |
| `sync-check.sh` (Stop hook) | End of any turn that changed code | Agent updates `STATE.md` + only the affected files (or says "Brain: no impact"). Fires once per distinct change set; silent otherwise. |
| `/brain-sync` | After merges, before releases, when drift is suspected | Compares code to brain for an area; fixes drift; bumps `Last verified`. |
| `brain-check.sh` | Session start (summary), manually, or in CI | Unfilled slots, files over budget, missing headers, stale `Last verified` dates. Exits 1 on issues. |

Run the full check yourself:

```
bash .claude/hooks/brain-check.sh
```

Add it to CI as a job to fail builds when the brain degrades.

**`STATE.md`** is the hand-off between sessions: current goal, in progress, next up, open questions,
blocked items, recent completions, and a handoff note. The agent updates it; you can edit it too —
e.g. set the goal for the week.

---

## 8. Saving tokens — your habits

The template keeps reads minimal. These habits matter even more:

1. **One task per session, then `/clear`.** Every request resends the whole conversation; a long
   session is the single biggest cost. `STATE.md` carries the handoff, so clearing loses nothing.
2. **Write the outcome, acceptance criteria, and a "similar to".** The agent searches far less.
3. **Let small tasks be small.** "Change the button label to Save" → fast path, no brain reads.
4. **Don't edit `AGENTS.md` casually.** Unchanged text is prompt-cached (~10% of normal price);
   every edit resets the cache.
5. **Pick the model for the job.** Sonnet for routine work, Opus for Large tasks. The scout already
   runs on Haiku.
6. **Measure.** `/context` shows what's loaded; `/cost` shows the spend. Compare a typical task
   before and after.
7. **Using lean-ctx?** Make sure it allows `bash` (`lean-ctx allow bash`), or manual brain checks
   are blocked. Hooks are unaffected.

Full list of mechanisms: `02-context-engineering/context-policy.md` §2.

---

## 9. Using other agents

| Feature | Claude Code | Codex / Cursor / Copilot / Gemini |
| --- | --- | --- |
| `AGENTS.md` entry point, fast path, non-negotiables | ✓ | ✓ (they read `AGENTS.md`) |
| Brain files, workflows, rulebook | ✓ | ✓ (by instruction) |
| Slash commands | ✓ | ✗ — ask in words: "follow `brain/05-graph-engineering/feature-workflow.md` for: …" |
| Guard hook, permissions | ✓ enforced | ✗ — rules are instructions only |
| `[route]` line, session notice, sync reminder | ✓ | ✗ — the agent uses `BRAIN.md` and `STATE.md` directly |
| Path-scoped rules, subagents | ✓ | ✗ |

Other agents still benefit from the structure, but only Claude Code gets the mechanical enforcement
and the hook-driven token savings.

---

## 10. Customize

| What | Where |
| --- | --- |
| Project-specific rules | `04-harness-engineering/README.md` §Project-specific rules (`P-1`, `P-2`, …) |
| Approval gates | `05-graph-engineering/approval-workflow.md` §1 Project-specific |
| Protected files | `04-harness-engineering/tools/safety-guardrails.md` §4 + `ask` entries in `.claude/settings.json` |
| Blocked / confirm-first commands | `EXTRA_DENY` / `EXTRA_ASK` at the top of `.claude/hooks/guard-bash.sh` |
| Prompt → file routing | `ROUTES` at the top of `.claude/hooks/route.sh` (whole-word regex `::` files) |
| Which files trigger UI / API rules | `paths:` in `.claude/rules/ui.md`, `api.md`, `data.md` |
| Definition of done | `08-quality-and-evaluation/definition-of-done.md` §Project-specific |
| Size budgets | `budget …` lines in `brain-check.sh` + rule `CTX-6` |
| Staleness threshold | env var `BRAIN_STALE_DAYS` (default 90) |
| Standards that don't apply | Replace the file body with `Not applicable — <reason>` (e.g. no frontend) |
| Subagent models | `model:` in `.claude/agents/*.md` |

Changing the harness (`.claude/**`, `AGENTS.md`) asks for your approval — the agent can't silently
weaken its own guardrails.

**Promote repeat mistakes to enforcement:** if review flags the same rule twice, turn it into a lint
rule, type, test, or hook pattern (`04-harness-engineering/enforcement/quality-enforcement.md` §3).

---

## 11. Enforced vs instructed

| Rule | Mechanism | Level |
| --- | --- | --- |
| No reading/editing secrets (`.env*` except `.env.example`, keys) | `settings.json` deny + `guard-bash.sh` | Enforced |
| No force-push, `--no-verify`, `rm -rf` on root/home/cwd, `curl \| sh`, history rewrite | `guard-bash.sh` deny | Enforced |
| `reset --hard`, `git clean`, discard-all, drop table, migrations reset, deploy, publish | `guard-bash.sh` ask | Enforced |
| Push, merge, rebase, dependency installs, editing the harness/CI | `settings.json` ask | Enforced |
| Brain sync after code changes | `sync-check.sh` Stop hook | Enforced reminder |
| Size budgets, placeholders, headers, staleness | `brain-check.sh` | Reported (CI can fail) |
| Lint, types, tests, build | Your project's tools + CI | Enforced if configured |
| Scope, patterns, architecture, gates, done | Brain files + review | Instructed |

Rule IDs and their levels: `04-harness-engineering/README.md` (`[E]` enforced, `[G]` approval gate,
`[R]` review).

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| No session notice, no `[route]` lines | Hooks not running | Check `.claude/settings.json` was copied/merged; on Windows, Git Bash must be installed; run `/hooks` in Claude Code to inspect. |
| Hooks fail with `$'\r': command not found` | Hook scripts checked out with CRLF | `.gitattributes` `*.sh text eol=lf`, then delete the four hook files and `git checkout -- .claude/hooks` (or re-run `install.sh --force`). |
| Brain files vanished / ended up on another branch | Installed into a linked worktree (`.claude/worktrees/…`) | Install into the main working-tree root (§3); `.claude/worktrees/` in `.gitignore`. |
| Notice says `unfilled` forever | Some slots unanswered | `bash .claude/hooks/brain-check.sh` lists the files; answer the open questions or mark `Not applicable`. |
| Guard blocked a legit command (e.g. `cp .env.example .env.local`) | Conservative pattern | Run it yourself, or narrow the pattern in `guard-bash.sh` (approval required). |
| `[route]` points to irrelevant files | Generic keywords | Edit `ROUTES` in `route.sh`; remove or tighten the pattern. |
| Sync reminder after every turn | Every turn changed code | Expected during multi-turn tasks; the agent answers in one line when nothing is affected. |
| Sync reminder never appears | Not a git repo, or no `brain/` folder | `git init`; keep the folder named `brain`. |
| Agent reads lots of brain files for a tiny change | It didn't take the fast path | Say "small task" in the prompt; check `/context`; tighten `ROUTES`. |
| Agent re-asks things the brain answers | Missing route or stale file | Add a `BRAIN.md` row / `ROUTES` entry; run `/brain-sync`. |
| `AGENTS.md over budget` | Next.js block or growth | Raise the budget deliberately, or move detail into a brain file. |
| `bash` blocked in the agent's shell | lean-ctx allowlist | `lean-ctx allow bash`. |
| Wrong facts in the brain | Drift | `/brain-sync <area>`; fix the file; bump `Last verified`. |

---

## 13. Folder reference

| Folder | Layer | Key files |
| --- | --- | --- |
| `01-prompt-engineering/` | How requests become verifiable work | `principles.md`, `prompt-templates.md`, `task-specifications.md` (spec + acceptance criteria), `output-contracts.md` (plan/report/review shapes) |
| `02-context-engineering/` | What to load and where facts live | `context-policy.md` (tiers, token economy, session hygiene), `project-context.md` (commands, stack, repo map), `context-retrieval.md`, `memory-strategy.md`, `source-of-truth.md` |
| `03-loop-engineering/` | How to iterate and when to stop | `development-loop.md`, `debugging-loop.md`, `testing-loop.md`, `review-loop.md`, `retry-strategy.md`, `stopping-conditions.md` |
| `04-harness-engineering/` | Rules for code and agents | `README.md` (**rulebook digest with IDs**), `architecture/`, `design/`, `coding/`, `tools/`, `enforcement/` |
| `05-graph-engineering/` | Workflows with gates | `workflow-design.md` (classification, splitting, bootstrap), `feature-`, `bugfix-`, `refactoring-`, `approval-`, `recovery-workflow.md` |
| `06-project-knowledge/` | What the system is and why | `product-overview.md`, `system-architecture.md` (+ invariants), `business-rules.md` (`BR-###`), `domain-model.md`, `integrations.md`, `security-model.md`, `glossary.md`, `decisions/` (ADRs) |
| `07-feature-documentation/` | One folder per feature | `feature-registry.md` (`F-###`), `feature-template.md`, `features/example-feature/` (copy-me) |
| `08-quality-and-evaluation/` | What "good" and "done" mean | `definition-of-done.md`, `testing-strategy.md` (+ regression policy), `evaluation-strategy.md`, `security-checklist.md` |
| `09-knowledge-maintenance/` | Keeping the brain true | `documentation-rules.md`, `synchronization-policy.md`, `change-impact-analysis.md`, `changelog.md` |
| `10-project-standards/` | Cross-cutting standards | `frontend-standards.md`, `accessibility.md`, `performance.md`, `observability.md`, `compatibility.md` |

### Conventions

| Marker | Meaning |
| --- | --- |
| Double-brace `UPPER_SNAKE` slot | Not yet filled — `/brain-init` fills it |
| `<angle field>` | Field in a copy-me template (feature folder, ADR) |
| `**Assumption:**` | Inferred, not confirmed |
| `**Open question:**` | Unknown — also listed in `STATE.md` |
| `Not applicable — <reason>` | Deliberately empty |
| `BR-###` · `ADR-####` · `KI-###` · `F-###` | Business rule · decision · known issue · feature (IDs never reused) |
| `ARCH-3`, `CODE-5`, … | Rulebook IDs — `[E]` enforced, `[G]` approval gate, `[R]` review |
