# Dependency Rules (internal)

> **Load when:** adding an import across modules or layers. **Rule:** ARCH-2.
> Third-party packages: `../tools/dependency-management.md`.

**Last verified:** 2026-10-11 (from the imports in `src/`)

## 1. Allowed directions

Read as "row may import column". ✓ = allowed (and used today unless marked *unused*).

| from ↓ / to → | `widget.ts` | `widget/` | `engine/` | `settings.ts` | `types.ts` / `labels.ts` |
| --- | --- | --- | --- | --- | --- |
| entries (`index.ts`, `react.ts`) | ✓ | ✗ | ✗ | ✓ | ✓ |
| `widget.ts` | — | ✓ | ✓ | ✓ | ✓ |
| `widget/` (ui, dom, icons) | ✗ | ✓ | ✗ | ✓ | ✓ |
| `engine/` (engine, css) | ✗ | ✗ | ✓ | ✓ | ✓ (types) |
| `settings.ts` | ✗ | ✗ | ✗ | — | ✓ (types) |
| `types.ts` / `labels.ts` | ✗ | ✗ | ✗ | ✗ | `types.ts` → `labels.ts` (type only) |

## 2. Universal rules

- No import cycles between modules.
- `engine/` (page) and `widget/` (panel) never import each other; `widget.ts` wires them.
- Only `src/react.ts` imports `react` (external in `tsup.config.ts`); core stays framework-free.
- No runtime third-party imports anywhere in `src/` (zero runtime dependencies, P-5).
- Tests import only the built `dist/` output; production code never imports test code.

## 3. Enforcement

- Mechanism: none (no import linter). ARCH-2 is [R] only — adding one is a TOOL-2 gate.

## 4. Exceptions

| From → To | Why | ADR |
| --- | --- | --- |
| `widget.ts` → `engine/css.ts` (`removeStyles`) | `destroy()` removes the shared stylesheet | none |
