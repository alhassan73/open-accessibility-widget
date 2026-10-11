# Retry Strategy

> **Load when:** an attempt failed and you are about to try again. **Rules:** ENF-2, ENF-3, TOOL-6.

Retrying the same thing expecting a different result burns tokens and time. Each retry must change
something and be justified by new evidence.

## Escalation ladder

| Attempt | Action |
| --- | --- |
| 1 | Fix the specific error you observed. |
| 2 | Same symptom → new hypothesis from fresh evidence (re-read error, logs, recent diff). |
| 3 | Narrow scope: smallest repro, revert to last green state, re-apply in smaller steps. |
| 4 | **Stop.** Report: what was tried, evidence, current hypothesis, recommended next step. Ask. |

Count attempts **per problem**, not per command. A new error after a fix is a new problem only if
the previous one is verifiably gone.

## Classify the failure first

| Class | Signs | Retry? |
| --- | --- | --- |
| Transient | Network timeout, rate limit, lock contention | Once, after a pause. Twice fails → report. |
| Environment | Missing env var, wrong version, port in use, missing binary | No. Report with output (TOOL-6). |
| Deterministic code | Same error every run | Not as-is. Change the hypothesis. |
| Flaky test | Passes/fails without code change | No rerun-until-green. Report as a defect. |
| Permission / gate | Denied by hook, settings, or user | Never retry verbatim. Adjust approach or ask. |

## Never

- Retry a destructive or side-effecting operation (migration, deploy, send) without approval.
- "Fix" by loosening a test, type, lint rule, or guard (ENF-2).
- Loop silently: every retry beyond the first is mentioned in the report.
