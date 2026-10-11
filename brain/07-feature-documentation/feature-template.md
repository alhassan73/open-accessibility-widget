# Feature Template — How to Document a Feature

> **Load when:** creating a feature folder.

## 1. Create

1. Copy `features/example-feature/` to `features/<kebab-slug>/`.
2. Replace every `<field>`; delete guidance comments.
3. Register it in `feature-registry.md` as the next `F-###`.

## 2. Size it to the feature (token budget)

| Feature size | Files to keep |
| --- | --- |
| Small (one screen/endpoint, no contracts) | `overview.md` + `testing.md` |
| Medium | + `requirements.md` + `workflows.md` |
| Large / has external contracts | All six |

Agents load **only the file the task needs**: behaviour → `requirements.md`; flows → `workflows.md`;
API/event/schema → `contracts.md`; what it depends on → `dependencies.md`; how it's verified →
`testing.md`. `overview.md` is the entry and links the rest.

## 3. What goes where

| File | Holds | Never holds |
| --- | --- | --- |
| `overview.md` | Purpose, users, status, entry points, code map | Detailed rules |
| `requirements.md` | Spec: requirements, acceptance criteria, BR-### refs, out of scope | Implementation detail |
| `workflows.md` | User + system flows, states, edge cases | Contracts |
| `contracts.md` | API endpoints, events, schemas, UI routes — the feature's public surface | Internal functions |
| `dependencies.md` | Modules, services, flags, config, other features it depends on / that depend on it | Package versions |
| `testing.md` | Test map per criterion, manual checks, known issues, flaky tests | Test code |

Business rules are referenced by `BR-###`, never restated. Decisions link to ADRs.
