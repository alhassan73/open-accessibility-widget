// Framework data for the Frameworks pages. Code stays English. The name, blurb, notes and most tab labels are
// translated and live in the messages, as `Frameworks.items.<slug>`. Every snippet follows the README and was
// checked against src/ (index.ts, react.ts, types.ts).
import { PKG, VERSION } from "@/lib/site";
import type { CodeTabItem, Framework } from "@/types";

// The pinned CDN tag carries Subresource Integrity, so a later release (or a compromised CDN) can't change what
// runs on a page. The hash is sha384 of the file jsDelivr serves for VERSION (unchanged from the npm tarball).
// Update it with VERSION on each release.
const CDN_BASE = `https://cdn.jsdelivr.net/npm/${PKG}`;
const CDN_FILE = `dist/${PKG}.global.js`;
const CDN_SRI = "sha384-l99wPNDtwhuNHq5Zl/AqRiCfsJVcmCD7fAMlOJjd61tQM72CY/M98kh9tC7WZsgA";

/** Follows every 1.x release; can't carry an integrity hash. */
export const CDN_TAG_MAJOR = `<script src="${CDN_BASE}@1/${CDN_FILE}"></script>`;
/** One exact version, with its hash: what production pages should use. */
export const CDN_TAG_PINNED = `<script src="${CDN_BASE}@${VERSION}/${CDN_FILE}"
        integrity="${CDN_SRI}" crossorigin="anonymous"></script>`;

/** npm, pnpm, yarn and bun tabs for the package. */
export const PM_TABS: CodeTabItem[] = [
  { label: "npm", lang: "bash", code: `npm install ${PKG}` },
  { label: "pnpm", lang: "bash", code: `pnpm add ${PKG}` },
  { label: "yarn", lang: "bash", code: `yarn add ${PKG}` },
  { label: "bun", lang: "bash", code: `bun add ${PKG}` },
];

const CDN_TABS: CodeTabItem[] = [
  { label: "CDN", lang: "html", code: CDN_TAG_PINNED },
  { label: "CDN @1", lang: "html", code: CDN_TAG_MAJOR },
];

export const FRAMEWORKS: Framework[] = [
  {
    slug: "vanilla",
    name: "JavaScript",
    install: [...CDN_TABS, ...PM_TABS],
    snippets: [
      {
        id: "script",
        lang: "html",
        code: `${CDN_TAG_PINNED}
<script>
  A11yWidget.init({
    position: "right",
    theme: { primary: "#0f766e", onPrimary: "#ffffff" },
    statementUrl: "/accessibility",
  });
</script>`,
      },
      {
        id: "bundler",
        lang: "ts",
        code: `import { init } from "${PKG}";

const widget = init({ position: "left" });

// later, from anywhere:
document.querySelector("#a11y-link")?.addEventListener("click", () => widget.open());`,
      },
    ],
  },

  {
    slug: "react",
    name: "React",
    install: PM_TABS,
    requires: "React 18+",
    snippets: [
      {
        id: "component",
        label: "App.tsx",
        lang: "tsx",
        code: `import { AccessibilityWidget } from "${PKG}/react";

export default function App() {
  return (
    <>
      <YourApp />
      <AccessibilityWidget position="right" theme={{ primary: "#0f766e" }} />
    </>
  );
}`,
      },
      {
        id: "hook",
        label: "FooterLink.tsx",
        lang: "tsx",
        code: `import { useAccessibility } from "${PKG}/react";

export function FooterLink() {
  const { widget, settings } = useAccessibility();
  return (
    <button type="button" onClick={() => widget?.open()}>
      Accessibility ({settings.fontSize}%)
    </button>
  );
}`,
      },
    ],
  },

  {
    slug: "next",
    name: "Next.js",
    install: PM_TABS,
    requires: "React 18+",
    snippets: [
      {
        id: "appLayout",
        label: "app/layout.tsx",
        lang: "tsx",
        code: `import { AccessibilityWidget } from "${PKG}/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AccessibilityWidget position="right" statementUrl="/accessibility" />
      </body>
    </html>
  );
}`,
      },
      {
        id: "pagesApp",
        label: "pages/_app.tsx",
        lang: "tsx",
        code: `import type { AppProps } from "next/app";
import { AccessibilityWidget } from "${PKG}/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <AccessibilityWidget position="right" />
    </>
  );
}`,
      },
      {
        id: "nonce",
        label: "app/layout.tsx (CSP nonce)",
        lang: "tsx",
        code: `import { headers } from "next/headers";
import { AccessibilityWidget } from "${PKG}/react";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined; // set by your proxy.ts
  return (
    <html lang="en">
      <body>
        {children}
        <AccessibilityWidget nonce={nonce} />
      </body>
    </html>
  );
}`,
      },
    ],
  },

  {
    slug: "vue",
    name: "Vue",
    install: PM_TABS,
    requires: "Vue 3",
    snippets: [
      {
        id: "app",
        label: "App.vue",
        lang: "vue",
        code: `<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { init } from "${PKG}";

let widget;
onMounted(() => (widget = init({ position: "right" })));
onBeforeUnmount(() => widget?.destroy());
</script>`,
      },
    ],
  },

  {
    slug: "nuxt",
    name: "Nuxt",
    install: PM_TABS,
    requires: "Nuxt 3",
    snippets: [
      {
        id: "plugin",
        label: "plugins/accessibility.client.ts",
        lang: "ts",
        code: `import { init } from "${PKG}";

// ".client" in the file name: Nuxt runs the plugin in the browser only.
export default defineNuxtPlugin(() => {
  init({ position: "right" });
});`,
      },
    ],
  },

  {
    slug: "angular",
    name: "Angular",
    install: PM_TABS,
    requires: "Angular 16+",
    snippets: [
      {
        id: "component",
        label: "app.component.ts",
        lang: "ts",
        code: `import { AfterViewInit, Component, NgZone, OnDestroy, inject } from "@angular/core";
import { init, type AccessibilityWidgetInstance } from "${PKG}";

@Component({ selector: "app-root", templateUrl: "./app.component.html" })
export class AppComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  private widget?: AccessibilityWidgetInstance;

  // Outside the zone: the widget's pointer and keyboard listeners must not run change detection.
  ngAfterViewInit() {
    this.widget = this.zone.runOutsideAngular(() => init({ position: "right" }));
  }

  ngOnDestroy() {
    this.widget?.destroy();
  }
}`,
      },
      {
        id: "ssr",
        label: "app.component.ts (SSR)",
        lang: "ts",
        code: `import { Component, afterNextRender } from "@angular/core";
import { init } from "${PKG}";

@Component({ selector: "app-root", templateUrl: "./app.component.html" })
export class AppComponent {
  constructor() {
    // Runs in the browser only, after the first render.
    afterNextRender(() => init({ position: "right" }));
  }
}`,
      },
    ],
  },

  {
    slug: "svelte",
    name: "Svelte",
    install: PM_TABS,
    snippets: [
      {
        id: "layout",
        label: "+layout.svelte",
        lang: "svelte",
        code: `<script>
  import { onMount } from "svelte";
  import { init } from "${PKG}";

  onMount(() => {
    const widget = init({ position: "right" });
    return () => widget.destroy();
  });
</script>

<slot />`,
      },
    ],
  },

  {
    slug: "astro",
    name: "Astro",
    install: PM_TABS,
    snippets: [
      {
        id: "layout",
        label: "src/layouts/Layout.astro",
        lang: "astro",
        code: `<html lang="en">
  <body>
    <slot />
    <script>
      import { init } from "${PKG}";
      init({ position: "right" });
    </script>
  </body>
</html>`,
      },
    ],
  },

  {
    slug: "cms",
    name: "WordPress",
    install: CDN_TABS,
    snippets: [
      {
        id: "footer",
        lang: "html",
        code: `<!-- Paste before </body>: theme footer, "custom code" or a header/footer plugin -->
${CDN_TAG_PINNED}
<script>
  A11yWidget.init({ position: "right", statementUrl: "/accessibility" });
</script>`,
      },
    ],
  },
];
