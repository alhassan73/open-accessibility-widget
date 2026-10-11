# Tool Permissions

> **Load when:** about to run a command or action with side effects. **Rule:** TOOL-1.
> Claude Code enforces this via `.claude/settings.json` + `.claude/hooks/guard-bash.sh`; other
> agents follow it as instruction.

## Tiers

| Tier | Agent may… | Examples |
| --- | --- | --- |
| **Free** | Act without asking | Read/search code and brain; run typecheck, lint, tests, build, dev server; `git status/diff/log/show/blame`; edit source files within task scope |
| **Ask** | Act only after explicit approval for this instance | `git commit`*, `git push`, merge, rebase, `git reset --hard`, `git clean`; install/remove/upgrade packages; DB migrations (even local); editing protected paths; editing `.claude/**`; network calls that write; deploy/infra commands |
| **Never** | Not even if asked casually — requires the user to do it or an explicit, specific instruction | Read/print secrets; force-push; `--no-verify`; rewrite shared history; production data writes; sending real emails/SMS/payments; `curl … \| sh`; disabling hooks/guardrails |

\* Commit is Free when the user asked for commits in this task.

## Rules

- Approval is **per instance and per scope** — "yes, install zod" does not approve other packages
  (`05-graph-engineering/approval-workflow.md`).
- A denied call is a decision: adjust, don't retry verbatim (`../../03-loop-engineering/retry-strategy.md`).
- Prefer read-only probes (`--dry-run`, `plan`, `status`) before any Ask-tier action.
- Never chain an Ask-tier command inside a Free-looking one (`npm test && git push`).

## Project additions

| Command / action | Tier | Why |
| --- | --- | --- |
| `npm run typecheck` / `build` / `size` / `check`, `npm test`, `node --test …` | Free | Project gates (allowed in `.claude/settings.json`) |
| `npm ci`, `npm audit`, `npm pack --dry-run` | Free | Don't change the lockfile or publish |
| `npm install`, `npm uninstall`, `npm update`, `npm audit fix` | Ask | Change the lockfile / dependencies (TOOL-2) |
| `npm version` | Ask | Bumps `package.json` and creates a release tag (guard `EXTRA_ASK`) |
| `git tag v*`, `git push` (incl. tags) | Ask | A pushed `v*` tag publishes to npm via `release.yml` |
| `npm publish` | Ask — normally never | Releases go through the tag → `release.yml` (Trusted Publishing) |
| `gh release …`, `gh workflow run …` | Ask | Release / Pages deploy (guard `EXTRA_ASK`) |
