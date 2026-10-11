# Review Loop

> **Load when:** finishing a unit (self-review) or asked to review (`/review`).
> **Rules:** ENF-4, CTX-5. Checklist source: `08-quality-and-evaluation/`.

```
1. Scope    → read the full diff (git diff / PR). Unexpected files in the diff = finding.
2. Intent   → does it meet every acceptance criterion? (spec / feature requirements.md)
3. Rules    → walk the rulebook prefixes the diff touches (ARCH/DES/CODE/TOOL/STD)
4. Risk     → security-checklist.md if input, auth, secrets, data, or external calls are touched
5. Evidence → were gates run and passing? Is there a test per criterion?
6. Report   → findings table (output-contracts.md §Review), ranked by severity
7. Fix      → apply fixes, re-run affected checks, re-review only the changed hunks
```

## Rules

- Review the **diff**, not the files: what changed, and what should have changed but didn't (docs,
  tests, callers, migrations).
- Every finding names a concrete failure scenario. "Could be cleaner" without cost is a nit.
- Cite rule IDs (`violates CODE-7`) instead of re-explaining rules.
- Self-review is mandatory for Medium/Large; for Large, delegate an independent pass to the
  `reviewer` subagent so the author's context doesn't bias it.
- Max 2 review→fix rounds before reporting remaining findings to the user (`stopping-conditions.md`).

## Fast self-review checklist

- [ ] Only intended files changed; no debug output, commented code, or stray formatting (CODE-7/8).
- [ ] Errors handled at the right boundary (DES-4); inputs validated (DES-3).
- [ ] Names and structure match the reference implementation (CODE-2).
- [ ] Tests cover each acceptance criterion and the error path.
- [ ] Brain files made wrong by this change are updated (`09-knowledge-maintenance/synchronization-policy.md`).
