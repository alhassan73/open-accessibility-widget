# Development Loop

> **Load when:** implementing anything Medium or larger. **Rules:** CODE-3, CODE-6, CODE-7, ENF-1.

```
┌─► 1. Pick the next increment (smallest step that leaves the system working)
│   2. Read what it touches (+ callers, + tests) — ranges, not whole files (CTX-1)
│   3. Change it, following the reference implementation and the rulebook
│   4. Fast check for this increment (see table)
│   5. Fail? ──► debugging-loop.md, bounded by retry-strategy.md
│   6. Self-review the increment diff
└── 7. More increments? ── no ──► full gates → review-loop.md → sync brain → report
```

## Increments

- One increment = one reason to change (a function, component, endpoint, migration).
- The system builds and existing tests pass after **every** increment.
- Front-load risk: contracts and data shape first, polish last.
- Refactor and behaviour change are never the same increment (CODE-6).

## While implementing

- Search for an existing helper/pattern before writing one (CODE-3).
- Change only what the increment needs (CODE-7). Note adjacent defects; don't fix them.
- New dependency, env var, config key, or public contract → stop at the gate (TOOL-2, ARCH-4).

## Fast checks

| Changed | Check |
| --- | --- |
| Logic | `npm run build`, then its test (`node --test test/settings.test.mjs` or `node --test --test-name-pattern=<name> test/widget.e2e.test.mjs`) — tests run against `dist/` |
| Types / signatures | `npm run typecheck` |
| UI / page adjustment | Build, open `examples/index.html`; the matching e2e test |
| Stored settings format | Old saved JSON still loads (or falls back by design); `STORAGE_VERSION` decision recorded |
| Config (`tsup`, `tsconfig`) | `npm run check` |

Full gates run at the end and after any increment touching shared code.
Exit only via `stopping-conditions.md`.
