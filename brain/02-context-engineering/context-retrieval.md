# Context Retrieval

> **Load when:** you don't know where a fact lives.

How to find what you need — in order, and when to stop looking.

---

## 1. Search order

1. **Brain** — the `[route]` line or the BRAIN.md row → the named file → the section. Use the
   knowledge index below.
2. **Feature folder** — `07-feature-documentation/feature-registry.md` → `features/<slug>/`.
3. **Code** — search by symbol/string/route/table name; follow imports from the entry point.
4. **Tests** — they show intended behaviour and real inputs.
5. **History** — `git log -S <term>`, `git log -- <path>`, `git blame` for *why*.
6. **Human** — only after 1–5, with the question shape in `01-prompt-engineering/output-contracts.md`.

## 2. Knowledge index — where each kind of fact lives

| Fact | Canonical location |
| --- | --- |
| Commands, stack, repo map | `02-context-engineering/project-context.md` |
| Module ownership, invariants | `06-project-knowledge/system-architecture.md` |
| Allowed imports between modules | `04-harness-engineering/architecture/dependency-rules.md` |
| Domain entities and relationships | `06-project-knowledge/domain-model.md` |
| Business rules `BR-###` | `06-project-knowledge/business-rules.md` |
| External services, contracts | `06-project-knowledge/integrations.md` |
| Authn/z, data classification | `06-project-knowledge/security-model.md` |
| Past decisions `ADR-####` | `06-project-knowledge/decisions/` |
| Term definitions | `06-project-knowledge/glossary.md` |
| Feature behaviour and contracts | `07-feature-documentation/features/<slug>/` |
| How code must look | `04-harness-engineering/coding/` |
| Current work, open questions | `STATE.md` |

Precedence when two locations disagree: `source-of-truth.md`.

## 3. Search tactics

- Search for the **user-visible string** (label, error text, URL) to find the entry point fast.
- Search **usages** before changing a signature; count them in the impact analysis.
- Search for an **existing helper** before writing one (`04-harness-engineering/coding/code-patterns.md`).
- When a term returns nothing, try its glossary synonyms and the DB/API spelling.

## 4. Stop retrieving when

- You can answer every question in `09-knowledge-maintenance/change-impact-analysis.md` §Questions
  (Medium/Large), or
- You can name the file to change, the pattern to follow, and the check that proves it (Small).

Over-retrieval is a failure mode: it burns context and delays the first verifiable step.
