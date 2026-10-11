# Debugging Loop

> **Load when:** anything fails unexpectedly. **Rules:** TOOL-6, ENF-2, ENF-3.

```
1. Reproduce   → reliable minimal repro (command, test, or steps). No repro, no fix.
2. Observe     → the FULL error, stack, logs; exact values
3. Localize    → bisect: layer → file → line → commit
4. Hypothesize → 1–3 ranked causes, each with the evidence that would confirm/refute it
5. Test        → gather that evidence (log, assertion, query) — no fix yet
6. Fix         → root cause, smallest change; failing test first when feasible
7. Verify      → repro passes, related tests pass, gates pass
8. Guard       → regression test stays; non-obvious trap → feature testing.md §Known issues
```

## Rules

- Read the whole error; the first line is often a symptom.
- One change per experiment; revert experiments that did not confirm a hypothesis.
- Fix causes, not symptoms. Reject: a catch that hides the error, a null-check skipping the bad path,
  a retry around a deterministic failure, a widened type — unless the spec says the condition is expected.
- Environment problem (missing env var, wrong version, stale build, port, network) → report with
  output (TOOL-6); don't change code to work around it.
- Two refuted hypotheses on one symptom → re-observe and widen the search (`retry-strategy.md`).
- Remove temporary logs/assertions before finishing (CODE-8).

## Localizers

`git bisect run <test>` · `git log -p -S '<symbol>'` · diff working vs failing input/env/commit ·
an assertion at each layer boundary.
