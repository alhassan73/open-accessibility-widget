---
paths:
  - "src/index.ts"
  - "src/types.ts"
  - "src/react.ts"
  - "src/engine/css.ts"
  - "tsup.config.ts"
  - "package.json"
---

# Public API and host-visible names (auto-loaded only when these paths are touched)

Rules: ARCH-4, CODE-5, P-3 — `brain/04-harness-engineering/README.md`.
- Exports, types, option names/defaults, React props/hook, `exports`, and `window.A11yWidget` are the
  public contract: any rename/removal/semantic change is an ARCH-4 approval gate and a semver decision.
- `a11yw-*` classes, `--a11yw-*` variables and `data-a11yw-*` attributes may be used by host pages —
  don't rename or remove them without approval.
- Additive change: doc comment in `src/types.ts`, README "All options"/"API", `CHANGELOG.md` `Added`.
- Compatibility rules: `brain/10-project-standards/compatibility.md`.
