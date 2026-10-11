# Refactoring Rules

> **Load when:** restructuring code without changing behaviour. **Rules:** CODE-6, CODE-7.
> Workflow: `05-graph-engineering/refactoring-workflow.md`.

## Rules

1. **Behaviour preserved, provably.** Tests pass before and after, unchanged. Thin coverage →
   characterization tests first.
2. **Never mixed** with a behaviour change or bug fix in the same increment/commit. Found a bug
   mid-refactor? Note it; fix it separately.
3. **Small, mechanical steps:** rename, extract, inline, move — one at a time, green after each.
4. **Only when asked or required** by the task at hand. No opportunistic repo-wide cleanups;
   report them as follow-ups.
5. **Shared code:** change with existing call sites still working (expand → migrate → contract),
   then remove the old path last.
6. **Public contracts** (exports used elsewhere, APIs, schemas) follow ARCH-4 even in a refactor.
7. **Use tools** (IDE rename, codemods) over hand edits for wide mechanical changes; review the diff.
8. **Leave no dual paths** at the end unless the plan says the migration continues; record that in
   `STATE.md`.

## Expand → migrate → contract

```
1. Expand    add the new path alongside the old (both work)
2. Migrate   move call sites in batches, green after each batch
3. Contract  delete the old path once usages = 0 (verify by search)
```
