# Contributing

Thanks for helping! Issues and pull requests are welcome.

## Setup

```bash
npm install
npm run check   # typecheck, build, bundle-size budget, unit + end-to-end tests
```

The end-to-end tests drive a local headless Chrome; set `CHROME_PATH` if it isn't found automatically.

## Guidelines

- **Accessibility first.** A change must not introduce keyboard traps, hidden focus, unlabeled controls or contrast below WCAG 2.2 AA. Prefer native HTML over ARIA.
- **Never break the host page.** Page adjustments must stay opt-in, scoped to `html.a11yw-*` classes, reversible by `destroy()`, and must not change layout or behavior when off.
- **No claims of compliance.** The widget offers user preferences; it does not make a site WCAG/ADA compliant. Keep docs and labels honest.
- **No runtime dependencies.** Keep the bundle within the size budget (`npm run size`).
- Add or update a test in `test/` for every bug fix or feature, and a line in `CHANGELOG.md`.
- New UI strings need an English and an Arabic translation in `src/labels.ts`.

## Manual checks before a release

Automated tests can't cover everything. Before a minor/major release, try the demo with:

- keyboard only (Tab, Shift+Tab, Enter, Space, arrows, Escape);
- a screen reader (NVDA or JAWS on Windows, VoiceOver on macOS/iOS, TalkBack on Android);
- Windows High Contrast, 200% and 400% browser zoom, and a phone in both orientations;
- Arabic (RTL).

## Branches and releasing

`main` always holds the latest release and deploys the demo. Each version also has its own branch named after it (e.g. `1.0.1`, `1.1.0`) that keeps that release's code.

1. Create the next version branch from `main` (e.g. `1.2.0`) and update `version` in `package.json` and `CHANGELOG.md`.
2. When it's ready, merge it into `main` (this also deploys the demo).
3. Tag `vX.Y.Z` and push the tag. The release workflow runs `npm run check` and publishes through npm Trusted Publishing (no token or 2FA code; provenance included). It skips versions already on npm. Tags keep the `v` prefix so they never share a name with a branch.
