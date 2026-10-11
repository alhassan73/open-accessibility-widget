# Coding Conventions

> **Load when:** creating a new file or unsure of a naming/style choice. **Rules:** CODE-1, CODE-2.
> No formatter or linter is configured — match the surrounding file exactly (CODE-2).

## 1. Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Files | short lowercase `.ts`; scripts kebab-case `.mjs` | `dom.ts`, `check-size.mjs` |
| Folders | short lowercase | `engine/`, `widget/` |
| Types / interfaces | PascalCase; public ones prefixed `Accessibility` | `AccessibilityWidgetOptions`, `UiApi` |
| Functions / variables | camelCase | `sanitizeSettings`, `createEngine` |
| Constants | UPPER_SNAKE for module-level constants | `DEFAULT_SETTINGS`, `STORAGE_VERSION` |
| Booleans | `is/has/can/should` prefix | `isDefaultSettings`, `hadStyleAttr` |
| CSS classes / variables / attributes | `a11yw-` prefix (`--a11yw-*`, `data-a11yw-*`) | `a11yw-hide-img`, `--a11yw-font` |
| Console messages | prefix `[open-accessibility-widget]` | `src/widget.ts` |
| Tests | `test/<area>.test.mjs`; e2e `*.e2e.test.mjs` | `widget.e2e.test.mjs` |

## 2. Structure

- Import order: relative imports, `import type` for type-only imports (`isolatedModules`); no
  enforced order.
- Path aliases: none — relative imports only.
- Exports: named only; no default exports in `src/`.
- Exported constants are frozen (`Object.freeze` / `freezeAll`) — tested in `settings.test.mjs`.
- File length guide: split past ~300 lines or more than one responsibility (`widget/ui.ts` is the
  known exception at ~840 lines; don't grow it without reason).

## 3. Comments

- Code says *what*; comments say *why* (constraints, workarounds, links to issues/ADRs).
- No commented-out code; git has history (CODE-8).
- `TODO(<issue-id>): …` only — never a bare TODO.
- Public APIs and options get a doc comment (`src/types.ts`).

## 4. Language-specific

- Browser APIs only behind a runtime check where support varies (`compatibility.md`).
- Strings shown to users come from `labels.ts`, never literals in `ui.ts`.
- Numbers from JS callers are clamped (`num()`); settings go through `sanitizeSettings`.

## 5. Git

- Branches: `main` + one per version `X.Y.Z`; tags `vX.Y.Z`; other branches **Open question:**
  (observed `review/compliance`) · Commits: imperative, sentence-case summary, no type prefix;
  releases `Release X.Y.Z: <summary>` (observed in `git log`).
- One logical change per commit; refactors and behaviour changes in separate commits (CODE-6).
- **Never** add Claude/AI attribution (no `Co-Authored-By: Claude`, no "Generated with Claude
  Code") to commits, PRs, or releases.
- Commit/push only when asked (`../tools/tool-permissions.md`).
