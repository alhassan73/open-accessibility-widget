# Output Contracts

> **Load when:** producing a plan, final report, question batch, or review. **Rule:** CTX-5.

The fixed shapes of what an agent hands back. Predictable output is reviewable output. Keep every
section; write "none" rather than dropping it.

---

## Plan (Medium/Large, before implementing)

```markdown
Goal: <1–2 sentences>
Class: <S/M/L> — <why>
Context pack: <feature folder, rules BR-###, reference implementation path>
Plan:
1. <step> — verify by <check>
Approval needed: <gate names / none>
Assumptions: <list / none>
```

## Final report (every task)

```markdown
**Done:** <one sentence — the outcome, not the activity>
**Changed:** <file — what/why>, …
**Verified:** `<command>` → pass/fail; <manual check> → result
**Not verified:** <what and why / none>
**Assumptions:** <list / none>
**Risks / follow-ups:** <adjacent defects found, not fixed / none>
**Brain updated:** <files / none>
```

Rules: never report a command as passing that you did not run; a failing gate is reported with its
output, not summarized away; no pasted unchanged code; no narrated searches.

## Questions (when blocked)

```markdown
I need <n> decisions before <step>:
1. <question>? — Recommended: <default> because <reason>. Alternative: <option>.
Meanwhile I <did / will do> <unblocked part>.
```

## Review findings

```markdown
| # | Severity | File:line | Finding | Fix |
| - | -------- | --------- | ------- | --- |
| 1 | blocker / major / minor / nit | path:42 | <defect + concrete failure scenario> | <specific change> |
```

Verdict line: `Ready` | `Ready after fixes #…` | `Not ready — <reason>`.

## Approval request

Format lives in `05-graph-engineering/approval-workflow.md` §Request.

## Severity scale

- **blocker** — wrong behaviour, data loss, security hole, broken build.
- **major** — violates a harness rule or acceptance criterion; likely defect.
- **minor** — convention or clarity issue with real cost.
- **nit** — preference; never blocks.
