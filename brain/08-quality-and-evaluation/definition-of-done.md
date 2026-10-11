# Definition of Done

> **Load when:** before reporting any unit complete. **Rule:** ENF-4. Every applicable box, evidenced.

## Every task

- [ ] Every acceptance criterion met, each with evidence (test name, command output, or named manual check).
- [ ] Gates run and passing — or "not run: <reason>" stated (`04-harness-engineering/enforcement/quality-enforcement.md` §1).
- [ ] Diff contains only intended changes; no debug output, commented code, stray formatting (CODE-7/8).
- [ ] Rulebook prefixes touched by the diff self-reviewed (`03-loop-engineering/review-loop.md`).
- [ ] No approval gate passed without explicit approval.
- [ ] Brain synced: files made wrong by the change updated (`09-knowledge-maintenance/synchronization-policy.md`).
- [ ] `STATE.md` updated.
- [ ] Report in `01-prompt-engineering/output-contracts.md` §Final report shape.

## When applicable

- [ ] **Behaviour change** → tests added per criterion + main error path.
- [ ] **Bug fix** → regression test that failed before the fix; root cause in report.
- [ ] **Input, auth, data, secrets, external calls** → `security-checklist.md` passed.
- [ ] **UI** → loading/empty/error states; keyboard + screen-reader basics (`10-project-standards/accessibility.md`);
      checked at mobile and desktop widths.
- [ ] **Performance-sensitive path** → within budgets (`10-project-standards/performance.md`).
- [ ] **Contract change** → consumers checked; versioning/compat honoured (`10-project-standards/compatibility.md`).
- [ ] **Stored-settings change** → `STORAGE_VERSION` decision made; old saved data still loads or falls back by design.
- [ ] **New feature** → feature folder + registry row; changelog `Added`.
- [ ] **Large** → independent review by `reviewer` subagent; findings resolved or reported.

## Project-specific

- [ ] `npm run check` passes (typecheck, build, size budget, unit + e2e); a skipped axe test is reported as not run.
- [ ] Every fix/feature has a test in `test/` and a line in `CHANGELOG.md` (P-10).
- [ ] New/changed UI strings exist in English and Arabic (`src/labels.ts`); RTL checked for UI changes.
- [ ] Options/API changes are reflected in README ("All options", "API") and `src/types.ts` doc comments.
- [ ] Widget unaffected by its own adjustments; `destroy()` still restores the page (BR-002, BR-003).
- [ ] No compliance or medical claims in code, labels, docs (BR-001); no AI attribution in commit text (P-11).

## Not done if

- Any gate fails, or a passing gate was claimed without being run.
- A test, lint rule, or type was weakened to pass (ENF-2).
- The build is left broken, even "temporarily".
