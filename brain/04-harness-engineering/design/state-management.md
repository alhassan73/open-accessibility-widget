# State Management and Data Flow

> **Load when:** adding state, persistence, or moving data between modules. **Rules:** DES-2, DES-3.

**Last verified:** 2026-10-11

## 1. Kinds of state — where each lives

| Kind | Example | Lives in | Tool |
| --- | --- | --- | --- |
| Visitor settings | `fontSize`, `profiles`, `colorMode` | `state.settings` in the `createAccessibilityWidget` closure (`src/widget.ts`) | Frozen snapshots via `getState`/`getSettings` |
| Persisted settings | Saved choices across visits | `localStorage[storageKey]` (default `a11yw-settings`), JSON `{ v: 1, …settings }`; language at `<key>:lang` | `loadSettings` / `saveSettings`; removed when equal to defaults |
| Panel UI state | open/closed, expanded sections | `state.isOpen` + `src/widget/ui.ts` | Built-in |
| Page effect state | Applied classes/vars, measured font sizes | `src/engine/engine.ts` (`classes`, `vars`, `data-a11yw-fs`) | Re-applied by a MutationObserver if a framework wipes them |
| Active instance | The one widget on the page | Registry on `globalThis[Symbol.for("a11yw.registry")]` | Shared across ESM/CJS copies |
| React view | Settings for components | `useSyncExternalStore` over `subscribe` + `onActiveWidgetChange` | `src/react.ts` |
| Server / URL / form state | — | Not applicable — no backend, routing, or forms | — |

## 2. State rules

- One source per piece of state: settings live only in `widget.ts`; the engine and UI receive them.
- Every write goes through `commitSettings` → `commit` (restrict removed features → engine.apply →
  save → ui.update → listeners/`onChange` last, via `safely`).
- Derive, don't store: the active-count badges and "adjustments on" dot are computed from settings.
- Precedence (README "Preferences and precedence"): page as authored < OS/browser settings
  (never overridden) < `initialSettings` < the visitor's saved choices.
- Cross-tab: the `storage` event re-commits the other tab's value without saving again.

## 3. Data flow

```
UI event (widget/ui.ts) ─► UiApi.setSettings / toggleProfile / reset
  ─► widget.ts: mergeSettings / toggleProfileSettings ─► restrict (features option)
  ─► engine.apply(settings)  (classes + --a11yw-* vars on <html>, font scaler, pointer tools, media)
  ─► saveSettings(localStorage) ─► ui.update ─► subscribe listeners + onChange (via safely)
localStorage / storage event / caller input ─► sanitizeSettings  (trust boundary)
```

- **Trust boundaries** (validate here): caller options and `setSettings` input, `localStorage`
  content, `storage` events, host-page content read by read mode (URLs via `safeUrl`).
- Changing the stored shape is a gate: bump `STORAGE_VERSION` and decide what happens to old data
  (today an unknown version falls back to defaults — `parseSettings`).
