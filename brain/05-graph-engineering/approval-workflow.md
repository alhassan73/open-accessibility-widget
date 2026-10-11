# Approval Workflow

> **Load when:** a gate is hit, or before any Large implementation. Plan freely; act only after approval.

## 1. Gates — explicit approval required before

**Universal**
- Adding, removing, or upgrading a dependency (TOOL-2).
- New module, layer, pattern, or framework; accepting an ADR (ARCH-3).
- Changing a public contract: API, DB schema, events, URLs/routes, config keys (ARCH-4).
- Data migrations or any change to persisted data.
- Adding an environment variable or secret.
- Auth, authorization, crypto, or session logic.
- Editing a protected path (`04-harness-engineering/tools/safety-guardrails.md` §4).
- Removing user-visible behaviour or a page.
- `git push`, merge, rebase, history rewrite, deploy, release, publish.
- Anything with real-world side effects (TOOL-4).
- Breaking an invariant (ARCH-6).

**Project-specific**
- Public API: exports, types, option names/defaults, React props/hook (`src/types.ts`, `src/index.ts`,
  `src/react.ts`), package `exports`, the IIFE `window.A11yWidget` global.
- Stored-settings format or key (`STORAGE_VERSION`, `a11yw-settings`, `:lang` suffix in `src/widget.ts`).
- Renaming/removing injected `a11yw-*` classes, `--a11yw-*` variables, or `data-a11yw-*` attributes.
- Removing a profile, setting, or `features` key, or changing a profile id.
- Any runtime dependency or runtime network request (P-5).
- Raising the bundle budget in `scripts/check-size.mjs` (P-6).
- Version bump, `v*` tag, npm publish, Pages deploy / workflow dispatch.
- Changing the "not a compliance tool" wording in README / labels (BR-001).

## 2. Request format

```markdown
**Approval needed: <gate name>**
Change: <one sentence>
Why: <need, linked to the task>
Impact: <files/contracts/data; who is affected> (change-impact-analysis.md)
Risk: <what could go wrong> · Rollback: <how>
Alternatives: <option — why not>
Proceed? (yes / no / modify)
```

## 3. What counts as approval

- An explicit "yes"/"approved"/"go ahead" to **this request**. Silence, emoji ambiguity, or approval
  of a different item is not approval.
- Scope-bound: covers exactly what was described. Scope grows → ask again.
- Does not carry over to later tasks or sessions, unless the user states a standing rule (then record
  it in the relevant brain file).
- "Do whatever you think" approves Free/Ask-tier choices inside the task — **never** Never-tier actions.

## 4. After the decision

- Approved → record in the plan/report ("Approved by user: <gate>"); ADRs move to `Accepted`.
- Rejected → do not seek the same outcome by another route; adjust or stop.
- Modified → re-state the change as modified, then proceed.
