# Open Accessibility Widget

[![npm version](https://img.shields.io/npm/v/open-accessibility-widget)](https://www.npmjs.com/package/open-accessibility-widget)
[![bundle size](https://img.shields.io/bundlephobia/minzip/open-accessibility-widget)](https://bundlephobia.com/package/open-accessibility-widget)
[![license](https://img.shields.io/npm/l/open-accessibility-widget)](https://github.com/alhassan73/open-accessibility-widget/blob/main/LICENSE)

**[Live demo →](https://alhassan73.github.io/open-accessibility-widget/)** · [GitHub](https://github.com/alhassan73/open-accessibility-widget) · [npm](https://www.npmjs.com/package/open-accessibility-widget)

A user-preference accessibility menu that works on **any website**: plain HTML/JS, React, Next.js, Vue, Nuxt, Angular, Svelte, Astro, WordPress and more. It has no runtime dependencies, ships its own TypeScript types, supports RTL and Arabic, and you can theme it with your brand colors and logo.

> **Compliance:** this widget lets each visitor adjust the page to their needs. It does **not** make a website ADA, EAA, EN 301 549 or WCAG compliant. Compliance depends on the site's own markup: alt text, labels, contrast, keyboard support and headings. Don't advertise the widget as a compliance solution.

## Features

| Area | What the visitor gets |
| --- | --- |
| **Quick profiles** | Motion sensitivity · Low vision · Focus mode · Easy reading · Keyboard user · Quiet media · Comfortable reading |
| **Text** | Text size · Page zoom · Line spacing · Letter spacing · Alignment (left / center / right) · Readable font |
| **Color** | Contrast (dark / light / high) · Saturation (gray / low / high) · Custom text, heading and background colors |
| **Reading aids** | Highlight headings · Highlight links · Text magnifier · Reading line · Focus window · Read mode |
| **Motion & navigation** | Stop animations · Mute media · Hide images · Highlight focus · Highlight on hover · Large cursor (dark / light) |
| **Built in** | Reset all · Accessibility statement link · Hide widget · Language menu (English / العربية, add your own) · "Skip to main content" link · `Alt+A` shortcut · Settings saved across visits |

The panel is a compact card that opens above the launcher with a short fade-and-rise animation. It has:

- A plain header with logo, title, language menu and close button.
- A grid of profile cards.
- Four collapsible sections with settings rows: switches, steppers and segmented choices. Each section shows how many of its adjustments are on.

A small dot on the launcher shows when any adjustment is active.

The widget itself follows WAI-ARIA, and every release is tested in headless Chrome with axe-core and keyboard-only scripts (see [Testing](#testing)):

- The panel is a dialog with a focus trap. Escape, the close button or a click outside closes it, and focus returns to the launcher.
- Sections are an accordion (`aria-expanded`), toggles are `role="switch"`, profile cards are toggle buttons (`aria-pressed`), and segmented choices are radio groups with arrow-key support.
- Steppers announce the new value with its name ("Text size 120%"); reset is announced too.
- Touch targets are at least 30×30px (WCAG 2.2 asks for 24px), and the panel follows the browser's default font size.
- The widget never changes itself: every adjustment (text, spacing, colors, filters, cursor, animations) applies to the page only, so the panel always looks and behaves the same.
- It respects `prefers-reduced-motion` and Windows High Contrast (`forced-colors`), where its color filters switch off so the system colors win.
- The `Alt+A` shortcut never fires while the visitor is typing a character with it (e.g. macOS Option+A → "å").

## Install

```bash
npm install open-accessibility-widget
```

Or with no build step, from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/open-accessibility-widget@1/dist/open-accessibility-widget.global.js"></script>
```

## Usage

The core is one function, `init(options)`, which mounts the widget on `<body>`. Call it **once, in the browser, after the page loads**. Calling it again replaces the existing widget.

### Plain HTML / JavaScript (no framework, no bundler)

```html
<script src="https://cdn.jsdelivr.net/npm/open-accessibility-widget@1/dist/open-accessibility-widget.global.js"></script>
<script>
  A11yWidget.init({
    position: "right",
    theme: { primary: "#7c3aed", onPrimary: "#ffffff" },
    icon: "/images/my-logo.svg",
    statementUrl: "/accessibility",
  });
</script>
```

This also works for WordPress, Shopify, Webflow, Wix custom code, PHP and Django templates: paste it before `</body>`.

### Any bundler (Vite, Webpack, Parcel…), JS or TS

```js
import { init } from "open-accessibility-widget";

init({ position: "left" });
```

### React (Vite, CRA, Remix, Gatsby)

```jsx
import { AccessibilityWidget } from "open-accessibility-widget/react";

export default function App() {
  return (
    <>
      <YourApp />
      <AccessibilityWidget position="right" theme={{ primary: "#0f766e" }} />
    </>
  );
}
```

Control the widget from any component with the hook:

```jsx
import { useAccessibility } from "open-accessibility-widget/react";

function FooterLink() {
  const { widget, settings } = useAccessibility();
  return <button onClick={() => widget?.open()}>Accessibility ({settings.fontSize}%)</button>;
}
```

### Next.js (App Router)

The `/react` entry is already marked `"use client"`, so you can put it straight into a Server Component layout:

```tsx
// app/layout.tsx
import { AccessibilityWidget } from "open-accessibility-widget/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AccessibilityWidget position="right" statementUrl="/accessibility" />
      </body>
    </html>
  );
}
```

On the Pages Router, put it in `pages/_app.tsx`.

### Vue 3

```vue
<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { init } from "open-accessibility-widget";

let widget;
onMounted(() => (widget = init({ position: "right" })));
onBeforeUnmount(() => widget?.destroy());
</script>
```

### Nuxt 3

```ts
// plugins/accessibility.client.ts   (.client = browser only)
import { init } from "open-accessibility-widget";

export default defineNuxtPlugin(() => {
  init({ position: "right" });
});
```

### Angular

```ts
// app.component.ts
import { AfterViewInit, Component, NgZone, OnDestroy, inject } from "@angular/core";
import { init, type AccessibilityWidgetInstance } from "open-accessibility-widget";

@Component({ selector: "app-root", templateUrl: "./app.component.html" })
export class AppComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  private widget?: AccessibilityWidgetInstance;
  // Outside the zone: the widget's pointer/keyboard listeners must not trigger change detection.
  ngAfterViewInit() { this.widget = this.zone.runOutsideAngular(() => init({ position: "right" })); }
  ngOnDestroy() { this.widget?.destroy(); }
}
```

If you use Angular SSR, wrap the call in `afterNextRender(() => …)` or check `isPlatformBrowser`. Zoneless apps don't need `runOutsideAngular`.

### Svelte / SvelteKit

```svelte
<script>
  import { onMount } from "svelte";
  import { init } from "open-accessibility-widget";

  onMount(() => {
    const widget = init({ position: "right" });
    return () => widget.destroy();
  });
</script>
```

### Astro

```astro
<script>
  import { init } from "open-accessibility-widget";
  init({ position: "right" });
</script>
```

Pages that swap `<body>` on navigation (Astro view transitions, Hotwire Turbo, htmx `hx-boost`) are supported: the widget re-attaches itself and re-applies the visitor's settings to the new page.

## Customization

### Colors and logo

```js
init({
  theme: {
    primary: "#7c3aed",   // launcher, header, active states
    onPrimary: "#ffffff", // text/icons on top of primary
    background: "#ffffff",
    surface: "#f5f3ff",   // footer, segmented controls, hover states
    text: "#1f2937",
    mutedText: "#4b5563",
    border: "#c4b5fd",
    radius: 16,           // number (px) or any CSS length
    fontFamily: "Cairo, Tahoma, sans-serif",
  },
  icon: "/logo.svg",      // launcher logo: image URL (svg/png/data: URI) or a DOM element
  logo: "/logo-white.svg",// optional logo next to the panel title (hidden by default)
  buttonSize: 64,
  position: "left",       // "left" | "right"
  offset: { x: 20, y: 90 },
  zIndex: 9999,
});
```

A console warning tells you when the theme makes part of the widget fail WCAG contrast: `onPrimary` on `primary` (4.5:1), `primary` as the focus outline on `background` (3:1), footer links on `surface`, and `text` / `mutedText` on `background` (4.5:1). Only hex colors are checked.

You can also theme it from CSS, which helps when it's injected by a CMS:

```css
.a11yw-widget { --a11yw-primary: #7c3aed; --a11yw-on-primary: #fff; --a11yw-radius: 16px; }
:root { --a11yw-hl: #d64000; } /* highlight color for titles / links / hover */
```

### Language and RTL

English and Arabic are built in, and visitors switch between them from the menu in the header. The starting language is the visitor's last choice, otherwise it matches `<html lang>` (so `lang="ar-EG"` gives Arabic RTL), otherwise the first language in the list.

```js
import { init, builtInLanguages } from "open-accessibility-widget";

init({ language: "ar" });   // start in Arabic (RTL)
init({ languages: false }); // hide the language menu (English only)

// Add your own language next to the built-in ones:
init({
  languages: [
    ...builtInLanguages,
    { code: "fr", name: "Français", labels: { title: "Accessibilité", resetAll: "Tout réinitialiser" } },
  ],
});

// Override single strings on top of whatever language is active:
init({ labels: { title: "Accessibility tools" } });
```

Strings missing from a language fall back to English. A custom language without `dir` is shown right-to-left when its code is an RTL language (`ar`, `he`, `fa`, `ur`…). `increase`, `decrease` and `reset` can place the setting name with `{label}` (e.g. `"{label} vergrößern"`); without it the name is appended. Percentages are formatted for the active language with `Intl.NumberFormat`.

### Removing controls and setting defaults

```js
init({
  // Remove controls you don't want to offer. A removed setting stays off.
  features: { hideImages: false, cursor: false, readMode: false },
  // First-visit settings (visitors' own saved choices win; "Reset all" returns to the page as authored).
  initialSettings: { fontSize: 110 },
});
```

Every setting key can be removed, plus `"profiles"` (the whole quick-profile grid) and `"readMode"`. A profile card is hidden when all of its adjustments are removed.

### All options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `"left" \| "right"` | `"left"` | Screen side |
| `offset` | `{ x?, y? }` | `{ x: 24, y: 24 }` | Distance from the edges (px, 0–1000) |
| `theme` | `AccessibilityTheme` | – | Colors, radius, font |
| `icon` | `string \| Element` | built-in icon | Launcher logo (pass only trusted elements: they are cloned as-is) |
| `logo` | `string \| Element \| null` | hidden | Logo next to the panel title |
| `buttonSize` | `number` | `56` | Launcher size (px, 24–160) |
| `features` | `Partial<Record<FeatureKey, boolean>>` | all on | Set a control to `false` to remove it |
| `initialSettings` | `Partial<AccessibilitySettings>` | – | Settings for visitors with nothing saved |
| `languages` | `AccessibilityLanguage[] \| false` | English + Arabic | Language menu entries |
| `language` | `string` | saved → `<html lang>` → first | Initial language |
| `labels` | `Partial<AccessibilityLabels>` | – | Override single strings |
| `dir` | `"ltr" \| "rtl"` | language's direction | Force widget direction |
| `shortcut` | `string \| false` | `"Alt+A"` | Toggle shortcut; also restores the widget after "Hide widget" (the button is hidden when `false`) |
| `statementUrl` | `string` | – | "Accessibility statement" link in the footer (http/https/relative only) |
| `showSkipLink` | `boolean` | `true` | "Skip to main content" link. Left out automatically when the page has no `<main>`/`<h1>` or already starts with its own skip link |
| `zIndex` | `number` | `2147483000` | Stacking order |
| `persist` | `boolean` | `true` | Save settings in localStorage (kept in sync across tabs) |
| `storageKey` | `string` | `"a11yw-settings"` | localStorage key |
| `nonce` | `string` | – | CSP nonce for the injected `<style>` |
| `onChange` | `(settings) => void` | – | Called when the visitor changes something |

## API

`init()` (alias `createAccessibilityWidget()`) returns an instance:

```ts
const widget = init();

widget.open(); widget.close(); widget.toggle();
widget.getSettings();                        // current settings (a frozen snapshot)
widget.setSettings({ fontSize: 120 });       // validated: bad values are ignored
widget.setSettings((s) => ({ fontSize: s.fontSize + 10 }));
widget.setSettings({ profiles: ["visionImpaired"] }); // applies the profile's adjustments too
widget.toggleProfile("visionImpaired");
widget.reset();
widget.setOptions({ theme: { primary: "#000" }, language: "ar" }); // change look/language at runtime
const unsubscribe = widget.subscribe(({ settings, isOpen }) => {});
widget.destroy();                            // removes the widget and undoes every page change
```

The global build exposes the same exports on `window.A11yWidget`, for example `A11yWidget.getAccessibilityWidget()?.open()`.

## How it works

- Every page adjustment is a class on `<html>` plus a CSS variable, from one injected stylesheet, so adjustments never compound and turning one off is a class removal. If your framework re-renders `<html class>` or `<html style>`, the widget puts its flags back.
- Font size measures each text element's original size once and stores it in a `data-a11yw-fs` attribute; one generated CSS rule per size scales it. No inline styles are written, and content added later (SPA route changes, lazy lists) is picked up automatically.
- The widget lives in `.a11yw-ignore`, a `display: contents` wrapper, so it never takes part in your layout (grid or flex `<body>` included), and every adjustment skips it. The saturation and high-contrast filters sit on a page-wide `backdrop-filter` layer just below the widget, so they recolor the page (fixed headers included) but not the widget; elements you stack above the widget's `zIndex` are not filtered.
- `destroy()` removes everything it added: classes, variables, attributes, styles and listeners.
- It works with SSR: nothing touches `window` until `init()` runs.
- It runs under strict CSPs: pass `nonce` for the injected `<style>` tags; no `eval`, no `innerHTML` (Trusted Types safe).

## Profiles

Profiles are shortcuts that switch on a few adjustments at once. They are not medical tools and don't make a page "safe" for any condition; the visitor can change every adjustment afterwards, and turning a profile off keeps the ones they changed. (Profile ids such as `seizureSafe` are kept for compatibility; the visible names describe what they do.)

| Profile (id) | Turns on | Helps with | Watch out for |
| --- | --- | --- | --- |
| Motion sensitivity (`seizureSafe`) | Stop animations, low saturation | Distraction and discomfort from CSS motion and bright colors | GIFs, `<canvas>`, video in iframes and JavaScript-driven animation are **not** stopped |
| Low vision (`visionImpaired`) | Text 120%, readable font, high contrast | Small or thin text, low-contrast pages | Contrast filter also changes images |
| Focus mode (`adhdFriendly`) | Focus window, stop animations, low saturation | Keeping your place; fewer moving distractions | The window follows the pointer and keyboard focus |
| Easy reading (`cognitiveDisability`) | Highlight headings and links, reading line, readable font | Seeing page structure and links at a glance | Outlines add visual noise on busy pages |
| Keyboard user (`keyboardNav`) | Strong focus outline, highlight links | Finding the focused element | – |
| Quiet media (`screenReader`) | Mute media, strong focus outline | Audio that starts on its own (e.g. over a screen reader) | Media the visitor starts or unmutes keeps playing with sound |
| Comfortable reading (`olderAdults`) | Text 120%, line spacing 130%, readable font, large cursor | Longer reading sessions | The large cursor replaces your OS cursor size |

## Limitations

What the widget can't do, so you don't promise it:

- It doesn't fix a page's markup: missing alt text, labels, headings, keyboard support and contrast in your own design still need fixing at the source.
- Adjustments don't reach inside `<iframe>`s (embedded video, maps, payment forms) or Shadow DOM (web components keep their own styles).
- Reading line, focus window and magnifier follow the mouse and keyboard focus; on touch screens they move only with focus.
- "Page zoom" uses CSS `zoom`, which doesn't trigger your media queries. Browser zoom (Ctrl/Cmd +) reflows better; suggest it in your accessibility statement.
- "Line spacing" sets an absolute line height of 1.5 × the chosen percentage on all text.
- Letter spacing is not applied to Arabic and other cursive scripts (it would break joined letters); word spacing still is.
- Color modes override background colors; the widget outlines selected/pressed states so they stay visible, but heavily custom-drawn controls can still look different.
- Color adjustments apply to the screen only, not to printing.

## Preferences and precedence

From lowest to highest priority:

1. **Your site's styles** — what every visitor gets by default.
2. **OS / browser settings** (`prefers-reduced-motion`, `forced-colors`, zoom, default font size) — the widget never overrides them on its own and never switches anything on from them. In forced-colors mode its color filters are disabled.
3. **`initialSettings`** — your defaults for first-time visitors.
4. **The visitor's saved choices** — always win once made; "Reset all" returns to the page as you authored it.

## Package contents

| Import | Format | Use it for |
| --- | --- | --- |
| `open-accessibility-widget` | ESM + CJS + `.d.ts` | Any framework or plain JS with a bundler |
| `open-accessibility-widget/react` | ESM + CJS + `.d.ts` | React component and hook (`react` ≥ 18 is an optional peer dependency) |
| `dist/open-accessibility-widget.global.js` | IIFE, about 20 KB gzipped | `<script>` tag; exposes `window.A11yWidget` |

No runtime dependencies.

## Browser support

Chrome / Edge 120+, Firefox 126+, Safari 16.4+ (desktop and mobile) get every feature. Older versions degrade feature by feature: for example "Page zoom" needs CSS `zoom` (Firefox 126), and keeping visitor-started media unmuted needs `navigator.userActivation` (Firefox 120, Safari 16.4).

## Testing

```bash
npm run check      # typecheck + build + bundle-size budget + all tests
npm test           # unit tests + end-to-end tests in headless Chrome (set CHROME_PATH if Chrome isn't found)
```

The end-to-end suite drives a real headless Chrome over the DevTools Protocol (no extra dependencies). It covers keyboard-only use, focus handling, axe-core (no violations allowed), host-page safety (layout, focus indicators, media, CSP, framework re-renders, `<body>` swaps), read mode, reflow at 320px and `destroy()`. CI runs it on every pull request (`.github/workflows/ci.yml`).

Automated tests can't replace a manual check with real screen readers (NVDA, JAWS, VoiceOver, TalkBack) and Windows High Contrast; please do one before major releases.

## Development

```bash
npm install
npm run build      # dist/: ESM, CJS, .d.ts, and the <script> build
npm run check
```

Open `examples/index.html` in a browser after building to try every feature on a sample page, with a playground for theme, logo, position and language. Every push to `main` rebuilds that page and deploys it as the [live demo](https://alhassan73.github.io/open-accessibility-widget/) (`.github/workflows/pages.yml`).

See [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md) and the [changelog](./CHANGELOG.md).

## License

MIT © alhassan-ahmed
