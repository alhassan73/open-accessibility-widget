# Observability

> **Load when:** adding console output or diagnosing behaviour reported by users. **Rule:** STD-4.
> Error/log rules in code: `04-harness-engineering/design/error-handling.md` §3.

## Stack

Not applicable for production telemetry — a client-side library with no logging, metrics,
tracing, error tracking, or alerting service, and no network requests (P-5).

| Signal | Tool | Where to look |
| --- | --- | --- |
| Developer diagnostics | `console.error` / `console.warn` prefixed `[open-accessibility-widget]` | Browser devtools on the host page |
| Build / test health | GitHub Actions; Vercel deployments | `ci.yml`, `release.yml` runs; Vercel dashboard for the docs site |
| Bundle size | `npm run size` output | CI log |
| User reports | GitHub issues; vulnerabilities via private security advisories | `SECURITY.md` |

## Rules

- No analytics or telemetry may be added (would add network requests — P-5 gate).
- Console output only for the cases in `error-handling.md` §1; never log visitor settings or page content.

## Agent run observability

An agent's work is observable through: the plan and final report (`01-prompt-engineering/output-contracts.md`),
`STATE.md`, the brain diff, and git history. Hooks that block an action print the reason to the agent.
