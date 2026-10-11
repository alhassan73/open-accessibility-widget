---
paths:
  - "src/widget.ts"
  - "src/settings.ts"
---

# Stored settings and validation (auto-loaded only when these paths are touched)

- Visitors' saved settings (`localStorage`, key `a11yw-settings`, `{ v: STORAGE_VERSION, … }`, plus
  `<key>:lang`) must keep loading after an upgrade. Changing the stored shape or key is an approval
  gate (`brain/05-graph-engineering/approval-workflow.md`); bump `STORAGE_VERSION` and decide what
  happens to old data.
- Everything from storage or callers goes through `sanitizeSettings` (BR-007); unknown keys ignored.
- Storage access stays in `try/catch` — blocked storage must not break the widget.
- Update `brain/06-project-knowledge/domain-model.md` when settings, profiles, or ranges change.
