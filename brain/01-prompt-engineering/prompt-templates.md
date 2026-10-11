# Prompt Templates

> **Load when:** a human is writing a task for an agent.

Copy, fill, send. Delete lines that do not apply. Claude Code users can run the slash command
instead — the fields are the same.

---

## Feature — `/feature`

```
Feature: <name>
Outcome: <what the user/system can do after this, one sentence>
Acceptance criteria:
  1. <observable behaviour>
  2. <edge case / error behaviour>
Out of scope: <what NOT to do>
Constraints: <files not to touch, compatibility, performance, deadline>
Similar to: <existing feature/file to copy conventions from>
Risk notes: <security, data, money, SEO, public API — or "none known">
```

## Bug fix — `/bugfix`

```
Bug: <one-line symptom>
Expected: <what should happen>
Actual: <what happens; exact error text / log / screenshot path>
Reproduce: <steps, input data, environment, URL>
Since: <version/commit/date if known>
Severity: <blocker | major | minor>
Constraints: <must not change X>
```

## Refactor — `/refactor`

```
Refactor: <what>
Why: <the problem with the current shape>
Behaviour change: none (behaviour changes are a separate task)
Boundaries: <modules in scope>
Proof of no regression: <tests/commands to run before and after>
```

## Investigation / spike (no code changes)

```
Question: <what we need to know>
Context: <decision it feeds>
Deliverable: <findings | recommendation | ADR draft>
Time box: <e.g. 30 min>
Do not modify files.
```

## Review — `/review`

```
Review: <branch | PR | path | "current diff">
Focus: <correctness | security | conventions | all>
Output: findings ranked by severity, file:line, concrete fix (output-contracts.md §Review)
```

## Brain sync — `/brain-sync`

```
Sync the brain with the code for: <area | "changes since <commit/date>">
Report every brain file changed and what was wrong.
```

## Session handoff

```
Update STATE.md: in-progress items, next steps, open questions, and a handoff note for a fresh
session that has none of this conversation.
```
