---
paths:
  - "src/widget/**"
  - "src/engine/**"
  - "src/labels.ts"
  - "examples/**"
---

# Widget UI and page adjustments (auto-loaded only when these paths are touched)

Rules: DES-5, STD-1, STD-2, P-2, P-3, P-7, P-8 — `brain/04-harness-engineering/README.md`.
- DOM only via `h()` / `createElementNS`; never `innerHTML` or HTML strings (Trusted Types).
- Page CSS only under `html.a11yw-*` and never reaching `.a11yw-ignore` (append `OUT`); no inline
  styles on host elements; `destroy()` must undo it all.
- Keyboard-operable, labelled, visible focus, WCAG 2.2 AA; respect reduced motion and forced colors.
- Strings in `labels.ts` for English **and** Arabic; logical CSS properties for RTL; theme vars only.
- Details only if needed: `04-harness-engineering/design/component-design.md`,
  `10-project-standards/frontend-standards.md`, `accessibility.md`.
