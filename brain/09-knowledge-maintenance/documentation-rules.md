# Documentation Rules

> **Load when:** writing or editing any brain file.

## 1. Every brain file

- Starts with `# Title` then a `> **Load when:** …` header (≤ 3 lines) so agents can decide from the
  first lines whether to read on (CTX-2).
- Knowledge files carry `Last verified: YYYY-MM-DD`.
- Stays within budget (CTX-6): ≤ 200 lines; `AGENTS.md` and `BRAIN.md` ≤ 60. Over budget → split by
  load condition, not by arbitrary size.
- Dates absolute (`YYYY-MM-DD`). Stable IDs, never reused: `BR-###` business rule, `ADR-####`
  decision, `KI-###` known issue, `F-###` feature.

## 2. Writing style (token-efficient)

- Facts and rules, not narrative. Tables and one-line bullets over paragraphs.
- Imperative for rules ("Validate input at the boundary"), present tense for facts.
- One fact, one home (`02-context-engineering/source-of-truth.md`); elsewhere, link with `file §section`.
- Reference rules by ID, business rules by `BR-###`, decisions by `ADR-####` — don't restate them.
- Concrete over abstract: paths, commands, names. No marketing, no filler, no "it's important to…".
- Examples only when the rule is ambiguous without one; keep them in HTML comments if long.

## 3. Markers

| Marker | Meaning |
| --- | --- |
| Double-brace UPPER_SNAKE slot | Unfilled init slot (`/brain-init`) |
| `<angle field>` | Field in a copy-me template |
| `**Assumption:**` | Inferred, unconfirmed |
| `**Open question:**` | Unknown; mirrored in `STATE.md` |
| `Not applicable — <reason>` | Section deliberately empty |

## 4. Don't

- Don't create a new brain file unless asked or a workflow requires it (feature folder, ADR). Extend
  the existing file whose load condition matches.
- Don't document what the code or git already states verbatim.
- Don't leave stale content "for history" — git keeps history; changelog keeps the summary.
- Don't put secrets, credentials, real personal data, or production records in any brain file.
