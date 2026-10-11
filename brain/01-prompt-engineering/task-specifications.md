# Task Specifications

> **Load when:** writing a spec (Medium/Large) or acceptance criteria.

A spec turns a request into a verifiable contract. Required for Medium and Large tasks. The agent
writes it from the request + retrieved context; the human confirms it for Large tasks.

**Where specs live:** in the response for Medium; for Large tasks and new features, in the feature
folder (`07-feature-documentation/features/<feature>/requirements.md`) so it outlives the session.

---

## Template

```markdown
### Spec: <title>
Class: Small | Medium | Large        Workflow: feature | bugfix | refactor
Goal: <1–2 sentences — the outcome>

Requirements
1. <requirement>                     (source: request | <brain file> | Assumption)

Acceptance criteria                  (rules: §Acceptance criteria below)
- [ ] Given <state>, when <action>, then <observable result>
- [ ] Error: given <failure>, then <behaviour>

Out of scope
- <excluded work>

Impact (Medium/Large — 09-knowledge-maintenance/change-impact-analysis.md)
- Modules / files: <list>
- Contracts: <API / schema / events / URLs / none>
- Data: <migration / none>
- Security: <authn/z, input, secrets / none>
- Approval gates hit: <list / none>

Plan (3–7 steps; system works after each)
1. <step>

Validation
- Gates: <from 04-harness-engineering/enforcement/quality-enforcement.md §Gates>
- Tests added/changed: <list>
- Manual check: <what, where>

Open questions
- <question> — default if unanswered: <choice>
```

## Acceptance criteria

- Format: `Given <state>, when <action>, then <observable result>`. One behaviour per line.
- Observable: an HTTP status, a rendered element, a DB row, a log line, a return value — never
  "works correctly" or "is fast".
- Cover: the happy path, each business rule (`BR-###`) involved, the main error path, empty/limit
  input, and permissions (who may / may not).
- Quantify non-functional criteria: "p95 < 300 ms", "WCAG 2.2 AA", "works on Chrome/Edge 120+, Firefox 126+, Safari 16.4+".
- Each criterion maps to ≥ 1 test or a named manual check; the final report cites which.

## Quality bar

- Every requirement traces to a source; untraced = `Assumption`.
- Every acceptance criterion is checkable by a test, a command, or a named manual check.
- If the spec exceeds one screen, split the task (`05-graph-engineering/workflow-design.md` §Splitting).
