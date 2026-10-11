# Anti-Patterns

> **Load when:** reviewing, or when a shortcut looks tempting. **Rule:** CODE-4.
> Each is a review finding (severity in brackets).

## Universal

| Anti-pattern | Instead | Sev |
| --- | --- | --- |
| Swallowed errors (empty catch, catch → null) | Handle or propagate (`../design/error-handling.md`) | major |
| Symptom fix (null-guard / retry / widened type hiding a bug) | Fix the root cause | major |
| Weakened test/assertion/lint rule to get green | Fix the code or justify the test change | blocker |
| Hard-coded secrets, URLs, IDs, environment values | Config module / env (names in `project-context.md`) | blocker |
| Untrusted input used unparsed (SQL, HTML, shell, paths) | Parse/validate at the boundary; parameterize | blocker |
| Copy-pasted logic (third copy) | Extract helper (CODE-3) | minor |
| Speculative generality (options/layers for no current need) | Delete; YAGNI | minor |
| God module / "utils" dumping ground | Move to owning module | minor |
| Drive-by refactor inside a feature/bugfix diff | Separate task (CODE-6/7) | minor |
| Commented-out code, debug output, bare TODO | Delete / `TODO(<issue>)` | minor |
| Magic numbers/strings repeated | Named constant | nit |
| Boolean flag parameter switching behaviour | Two functions or an options object | minor |
| Deep nesting (> 3 levels) | Early returns, extract function | nit |
| Mutating shared/input data unexpectedly | Return new values | major |
| Time/randomness/network called directly in core logic | Inject (testability) | minor |
| N+1 queries / requests in loops | Batch or join | major |
| Unbounded queries/lists | Paginate / limit | major |

## Project-specific

<!-- Mistakes this codebase has actually made; add one line each when a review finds a repeat. -->
| Anti-pattern | Instead | Sev |
| --- | --- | --- |
| Adjustment selector or property that reaches the widget (fixed in 1.1.1) | Append `OUT` / keep filters on the backdrop layer below the widget | major |
| Widget or adjustment that changes host layout when off (fixed in 1.1.0: widget was a grid/flex item) | `.a11yw-ignore` stays `display: contents`; rules only under `html.a11yw-*` | major |
| Highlight outline that hides the focus indicator (fixed in 1.1.0) | `:not(:focus-visible)` on highlight outlines | major |
| HTML strings / `innerHTML` (breaks Trusted Types) | `h()` + text nodes, `createElementNS` | blocker |
| Inline styles on host elements; `style` attribute left after `destroy()` | Class + CSS variable; `data-a11yw-*` + generated rule | major |
| Consumer callback or bad input that breaks widget state (fixed in 1.1.0) | `safely()`, `sanitizeSettings`, ignore unknown ids | major |
| UI string added in English only | Add to `defaultLabels` and `arabicLabels` | minor |
| Copy that implies compliance or medical effect | Describe what the setting does (BR-001) | blocker |
