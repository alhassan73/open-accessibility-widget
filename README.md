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
| **Quick profiles** | Motion sensitivity · Low vision · Focus mode · Easy reading · Keyboard user · Screen reader user · Comfortable reading |
| **Text** | Text size · Page zoom · Line spacing · Letter spacing · Alignment · Readable font |
| **Color** | Contrast (dark / light / high) · Saturation (gray / low / high) · Custom text, heading and background colors |
| **Reading aids** | Highlight headings · Highlight links · Text magnifier · Reading line · Focus window · Read mode |
| **Motion & navigation** | Stop animations · Mute media · Hide images · Highlight focus · Highlight on hover · Large cursor (dark / light) |
| **Built in** | Reset all · Accessibility statement link · Hide widget · Language menu (English / العربية, add your own) · "Skip to main content" link · `Alt+A` shortcut · Settings saved across visits |

The panel is a compact card that opens above the launcher with a short fade-and-rise animation. It has:

- A plain header with logo, title, language menu and close button.
- A grid of profile cards.
- Four collapsible sections with settings rows: switches, steppers and segmented choices. Each section shows how many of its adjustments are on.

A small dot on the launcher shows when any adjustment is active.

The widget itself follows WAI-ARIA:

- The panel is a dialog with a focus trap. Escape, the close button or a click outside closes it, and focus returns to the launcher.
- Sections are an accordion (`aria-expanded`), toggles are `role="switch"`, profile cards are toggle buttons (`aria-pressed`), and segmented choices are radio groups with arrow-key support.
- Value changes and reset are announced through live regions.
- Touch targets are 44px.
- It respects `prefers-reduced-motion` and Windows High Contrast (`forced-colors`).

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
import { AfterViewInit, Component, OnDestroy } from "@angular/core";
import { init, type AccessibilityWidgetInstance } from "open-accessibility-widget";

@Component({ selector: "app-root", templateUrl: "./app.component.html" })
export class AppComponent implements AfterViewInit, OnDestroy {
  private widget?: AccessibilityWidgetInstance;
  ngAfterViewInit() { this.widget = init({ position: "right" }); }
  ngOnDestroy() { this.widget?.destroy(); }
}
```

If you use Angular SSR, wrap the call in `afterNextRender(() => …)` or check `isPlatformBrowser`.

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

If `primary` and `onPrimary` have less than 4.5:1 contrast, a console warning tells you.

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

Strings missing from a language fall back to English.

### All options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `"left" \| "right"` | `"left"` | Screen side |
| `offset` | `{ x?, y? }` | `{ x: 24, y: 24 }` | Distance from the edges (px) |
| `theme` | `AccessibilityTheme` | – | Colors, radius, font |
| `icon` | `string \| Element` | built-in icon | Launcher logo |
| `logo` | `string \| Element \| null` | hidden | Logo next to the panel title |
| `buttonSize` | `number` | `56` | Launcher size (px) |
| `languages` | `AccessibilityLanguage[] \| false` | English + Arabic | Language menu entries |
| `language` | `string` | saved → `<html lang>` → first | Initial language |
| `labels` | `Partial<AccessibilityLabels>` | – | Override single strings |
| `dir` | `"ltr" \| "rtl"` | language's direction | Force widget direction |
| `shortcut` | `string \| false` | `"Alt+A"` | Toggle shortcut; also restores the widget after "Hide widget" (the button is hidden when `false`) |
| `statementUrl` | `string` | – | "Accessibility statement" link in the footer (http/https/relative only) |
| `showSkipLink` | `boolean` | `true` | "Skip to main content" link |
| `zIndex` | `number` | `2147483000` | Stacking order |
| `persist` | `boolean` | `true` | Save settings in localStorage |
| `storageKey` | `string` | `"a11yw-settings"` | localStorage key |
| `nonce` | `string` | – | CSP nonce for the injected `<style>` |
| `onChange` | `(settings) => void` | – | Called when the visitor changes something |

## API

`init()` (alias `createAccessibilityWidget()`) returns an instance:

```ts
const widget = init();

widget.open(); widget.close(); widget.toggle();
widget.getSettings();                        // current settings
widget.setSettings({ fontSize: 120 });       // validated: bad values are ignored
widget.setSettings((s) => ({ fontSize: s.fontSize + 10 }));
widget.toggleProfile("visionImpaired");
widget.reset();
widget.setOptions({ theme: { primary: "#000" }, language: "ar" }); // change look/language at runtime
const unsubscribe = widget.subscribe(({ settings, isOpen }) => {});
widget.destroy();                            // removes the widget and undoes every page change
```

The global build exposes the same exports on `window.A11yWidget`, for example `A11yWidget.getAccessibilityWidget()?.open()`.

## How it works

- Every page adjustment is a class on `<html>` plus a CSS variable, from one injected stylesheet. The widget never leaves stray inline styles on your elements, adjustments never compound, and `destroy()` restores the page exactly.
- Font size measures each text element's original size once and scales it through a variable. Content added later (SPA route changes, lazy lists) is picked up automatically.
- The widget lives in `.a11yw-ignore` and is excluded from all page adjustments.
- It works with SSR: nothing touches `window` until `init()` runs.

## Package contents

| Import | Format | Use it for |
| --- | --- | --- |
| `open-accessibility-widget` | ESM + CJS + `.d.ts` | Any framework or plain JS with a bundler |
| `open-accessibility-widget/react` | ESM + CJS + `.d.ts` | React component and hook (`react` ≥ 18 is an optional peer dependency) |
| `dist/open-accessibility-widget.global.js` | IIFE, about 16 KB gzipped | `<script>` tag; exposes `window.A11yWidget` |

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile). The widget uses modern CSS (`:is()`, `color-mix()`, logical properties), so very old browsers may show it unstyled.

## Development

```bash
npm install
npm run typecheck
npm run build      # dist/: ESM, CJS, .d.ts, and the <script> build
```

Open `examples/index.html` in a browser after building to try every feature on a sample page, with a playground for theme, logo, position and language. Every push to `main` rebuilds that page and deploys it as the [live demo](https://alhassan73.github.io/open-accessibility-widget/) (`.github/workflows/pages.yml`).

## Changelog

### 1.0.0

First release:

- Framework-agnostic core (`init`) plus a React adapter and a `<script>` build.
- 7 quick profiles; text, color, reading-aid and motion/navigation adjustments; read mode.
- Theming (colors, radius, font, logo), English and Arabic with RTL, custom languages.
- Settings saved per visitor, an `Alt+A` shortcut, a skip link and a "Hide widget" option.
- An accessible widget UI: dialog, accordion, switches and radio groups, and an animated open/close that respects reduced-motion settings.

## License

MIT © alhassan-ahmed
