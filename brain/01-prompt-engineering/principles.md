# Prompt Engineering — Principles

> **Load when:** a request is ambiguous, or before restating a Medium/Large request.

How requests are written (by humans) and interpreted (by agents). Goal: every request becomes an
unambiguous, verifiable unit of work before code is touched.

---

## 1. Humans writing requests

1. **State the outcome, not the keystrokes.** "Users can reset their password by email" beats
   "add a function in auth".
2. **Give acceptance criteria** — observable behaviour (`task-specifications.md` §Acceptance criteria).
3. **Bound the scope.** Say what is out of scope.
4. **Name constraints** — files not to touch, compatibility, performance, deadline.
5. **Point at an equivalent.** "Like the invoices list" anchors conventions faster than prose.
6. **One unit per request.** Split "build X, refactor Y, upgrade Z" into three.
7. Use `prompt-templates.md` for anything Medium or larger.

## 2. Agents reading requests

1. **Restate before acting** (Medium/Large): goal in 1–2 sentences, requirements as a numbered list,
   inferred items marked `**Assumption:**`.
2. **Search before asking**: brain → nearest equivalent code → tests → git history
   (`02-context-engineering/context-retrieval.md`). Resolve it yourself when exactly one answer fits
   existing patterns.
3. **Ask when** an assumption would produce materially different work, or touches security, data,
   money, public contracts (API, schema, URLs), or production. One batch of precise questions, each
   with a recommended default (`output-contracts.md` §Questions).
4. **Otherwise proceed** and record the assumption.
5. **Deliver the unblocked part** before waiting on the blocked part.
6. **Never invent** an endpoint, field meaning, business rule, env var, or config key.
7. **Request vs brain conflict**: implement the request, state the conflict, propose the brain fix.
   Approval gates and safety guardrails are the exception — stop and ask.
8. **Literal scope.** Report — don't fix — adjacent problems, one line each.

## 3. A spec is required first when

- The change can't be described in under ten sentences.
- It touches > ~5 files or more than one module boundary.
- It changes a public contract, data shape, or persisted data.
- Acceptance criteria are missing and not inferable.
- The task is classified Large.

Spec format: `task-specifications.md`.
