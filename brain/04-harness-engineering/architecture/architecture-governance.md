# Architecture Governance

> **Load when:** a change adds or reshapes structure — new module, layer, pattern, dependency
> direction, or public contract. **Rules:** ARCH-1…6.

## 1. Principles

1. **Boundaries over cleverness.** A clear owner for each concern beats a smart abstraction.
2. **One way to do each thing.** A second pattern for a solved problem is a cost, not an option.
3. **Dependencies point inward/downward** to stable, policy-level code (`dependency-rules.md`).
4. **Contracts are explicit and versioned** at every boundary that crosses a team, process, or network.
5. **Reversible by default.** Prefer decisions that are cheap to undo; record the ones that aren't.
6. **Simplest structure that meets current requirements** — no speculative layers (YAGNI).

## 2. What needs what

| Change | Needs |
| --- | --- |
| Code inside an existing module, existing pattern | Nothing extra |
| New file/folder within a module, existing pattern | Follow `module-boundaries.md` |
| New module or layer | ADR + approval (ARCH-3) |
| New pattern / second way of doing a thing | ADR + approval (ARCH-3) |
| New dependency direction or exception to `dependency-rules.md` | ADR + approval |
| Public contract change (API, schema, event, URL, config key) | Impact analysis + approval (ARCH-4) |
| Breaking an invariant | ADR + approval (ARCH-6) |
| New framework / runtime / datastore | ADR + approval + `tools/dependency-management.md` |

## 3. Decision records (ADRs)

- Location: `06-project-knowledge/decisions/ADR-####-<slug>.md`, copied from `0000-adr-template.md`.
- Numbering: next free 4-digit number; never reused.
- Status flow: `Proposed` → `Accepted` | `Rejected` → (later) `Superseded by ADR-####`.
- An agent may **draft** an ADR (`Proposed`); only the user moves it to `Accepted`.
- ADRs are immutable once accepted — change direction with a new ADR that supersedes it.
- Write one when: the choice is costly to reverse, a reasonable engineer would choose differently,
  or someone will later ask "why is it like this?".

## 4. Review triggers

Architecture is re-checked (`/brain-sync` on `06-project-knowledge/system-architecture.md`) when:
a module is added/removed, a dependency direction changes, or an ADR is accepted.
