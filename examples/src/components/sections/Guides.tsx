import {
  Accessibility,
  ArrowRight,
  Ban,
  Languages,
  Lock,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code/CodeBlock";
import { DocSection } from "@/components/layout/DocSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CDN_TAG_PINNED } from "@/content/frameworks";
import { GUIDE_SECTIONS } from "@/content/guide-sections";
import { GUIDES } from "@/content/guides";
import { Link } from "@/i18n/navigation";
import { PKG } from "@/lib/site";
import type { Guide, GuideSlug } from "@/types";
import { Callout } from "./Callout";
import { rich } from "./Rich";

// ---- code shown in the guides (English, language-neutral) ----

const THEME_SNIPPET = `init({
  theme: {
    primary: "#7c3aed",   // launcher, header, active states
    onPrimary: "#ffffff", // text and icons on top of primary
    background: "#ffffff",
    surface: "#f5f3ff",   // footer, segmented controls, hover states
    text: "#1f2937",
    mutedText: "#4b5563",
    border: "#c4b5fd",
    radius: 16,           // number (px) or any CSS length
    fontFamily: "Cairo, Tahoma, sans-serif",
  },
});`;

const CSS_SNIPPET = `.a11yw-widget {
  --a11yw-primary: #7c3aed;
  --a11yw-on-primary: #ffffff;
  --a11yw-radius: 16px;
}
:root {
  --a11yw-hl: #d64000; /* outline color of "highlight headings / links / hover" */
}`;

const LOGO_SNIPPET = `init({
  icon: "/logo.svg",       // launcher: an image URL (svg, png, data: URI) or a DOM element
  logo: "/logo-white.svg", // next to the panel title (hidden by default)
});`;

const PLACEMENT_SNIPPET = `init({
  position: "left",        // "left" (default) or "right"
  offset: { x: 20, y: 90 }, // px from the screen edges, 0–1000
  buttonSize: 64,          // launcher diameter, 24–160 px
  zIndex: 9999,
});`;

const LANGUAGE_SNIPPET = `import { init } from "${PKG}";

init({ language: "ar" });   // start in Arabic (right-to-left)
init({ languages: false }); // hide the language menu (English only)`;

const CUSTOM_LANGUAGE_SNIPPET = `import { init, builtInLanguages } from "${PKG}";

init({
  languages: [
    ...builtInLanguages,
    { code: "fr", name: "Français", labels: { title: "Accessibilité", resetAll: "Tout réinitialiser" } },
  ],
});`;

const LABELS_SNIPPET = `init({ labels: { title: "Accessibility tools" } });

// increase, decrease and reset can place the setting's name:
init({ labels: { increase: "{label} vergrößern" } });`;

const DIR_SNIPPET = `init({ dir: "rtl" }); // force the widget's direction, whatever the language`;

const FEATURES_SNIPPET = `init({
  // A removed setting stays off.
  // "profiles" removes the whole grid, "readMode" the read-mode button.
  features: { hideImages: false, cursor: false, readMode: false },
});`;

const INITIAL_SNIPPET = `init({
  // For visitors with nothing saved. Their own choices win;
  // "Reset all" returns to the page as authored.
  initialSettings: { fontSize: 110 },
});`;

const STORED_SNIPPET = `// localStorage["a11yw-settings"]
{"v":1,"fontSize":120,"profiles":["visionImpaired"],"readableFont":true,"colorMode":"high-contrast"}

// localStorage["a11yw-settings:lang"]
ar`;

const CONSENT_SNIPPET = `const widget = init({ persist: false }); // store nothing yet

onConsent(() => {
  widget.setOptions({ persist: true });     // saving starts with the visitor's next change
});`;

const CSP_HEADER = `Content-Security-Policy: script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'nonce-RANDOM'; img-src 'self' data:; require-trusted-types-for 'script'`;

const NONCE_SNIPPET = `A11yWidget.init({ nonce: "RANDOM" }); // the same per-response nonce as in the header`;

const SRI_SNIPPET = `curl -s https://cdn.jsdelivr.net/npm/${PKG}@<version>/dist/${PKG}.global.js \\
  | openssl dgst -sha384 -binary | openssl base64 -A`;

// ---- language-neutral table columns ----

/** Profile ids, in the order of `Guides.controls.profiles` in the messages. */
const PROFILE_IDS = [
  "seizureSafe",
  "visionImpaired",
  "adhdFriendly",
  "cognitiveDisability",
  "keyboardNav",
  "screenReader",
  "olderAdults",
];

/** Keys of each row of the keyboard table, in the order of `Guides.accessibility.keys`. */
const KEYS: string[][] = [
  ["Alt", "A"],
  ["Esc"],
  ["Tab", "Shift + Tab"],
  ["Enter", "Space"],
  ["←", "→"],
  ["↑", "↓", "Home", "End"],
];

// ---- building blocks ----

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      dir="ltr"
      className="inline-block rounded-md border bg-muted px-1.5 py-0.5 font-mono text-caption text-foreground"
    >
      {children}
    </kbd>
  );
}

function SimpleTable({
  caption,
  scroll,
  head,
  rows,
}: {
  caption: string;
  scroll: string;
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <Table scrollLabel={`${scroll} ${caption}`} className="min-w-120">
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {head.map((h) => (
            <TableHead key={h} scope="col">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((cells, i) => (
          <TableRow key={i}>
            {cells.map((cell, j) => (
              <TableCell
                key={j}
                className={j === 0 ? "font-bold text-foreground" : "text-muted-foreground"}
              >
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Code, tables and notes that follow a section's text, by guide and section id. */
function useExtras(): Partial<Record<GuideSlug, Record<string, ReactNode>>> {
  const t = useTranslations("Guides");
  const scroll = t("scroll");
  const profiles = t.raw("controls.profiles") as unknown[];
  const keys = t.raw("accessibility.keys") as unknown[];
  return {
    theming: {
      colors: <CodeBlock code={THEME_SNIPPET} lang="ts" />,
      css: <CodeBlock code={CSS_SNIPPET} lang="css" />,
      logo: <CodeBlock code={LOGO_SNIPPET} lang="ts" />,
      placement: <CodeBlock code={PLACEMENT_SNIPPET} lang="ts" />,
    },
    languages: {
      choose: <CodeBlock code={LANGUAGE_SNIPPET} lang="ts" />,
      custom: <CodeBlock code={CUSTOM_LANGUAGE_SNIPPET} lang="ts" />,
      strings: <CodeBlock code={LABELS_SNIPPET} lang="ts" />,
      rtl: <CodeBlock code={DIR_SNIPPET} lang="ts" />,
    },
    controls: {
      remove: <CodeBlock code={FEATURES_SNIPPET} lang="ts" />,
      defaults: <CodeBlock code={INITIAL_SNIPPET} lang="ts" />,
      profiles: (
        <SimpleTable
          caption={t("controls.profilesCaption")}
          scroll={scroll}
          head={[t("controls.colProfile"), t("controls.colOn"), t("controls.colWatch")]}
          rows={profiles.map((_, i) => [
            <span key="n" className="grid gap-1">
              {t(`controls.profiles.${i}.name`)}
              <code dir="ltr" className="font-mono text-caption font-normal text-muted-foreground">
                {PROFILE_IDS[i]}
              </code>
            </span>,
            t(`controls.profiles.${i}.on`),
            t(`controls.profiles.${i}.watch`),
          ])}
        />
      ),
    },
    accessibility: {
      keyboard: (
        <SimpleTable
          caption={t("accessibility.keysCaption")}
          scroll={scroll}
          head={[t("accessibility.colKeys"), t("accessibility.colAction")]}
          rows={keys.map((_, i) => [
            <span key="k" className="inline-flex flex-wrap items-center gap-1" dir="ltr">
              {(KEYS[i] ?? []).map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>,
            t(`accessibility.keys.${i}`),
          ])}
        />
      ),
    },
    privacy: {
      stored: <CodeBlock code={STORED_SNIPPET} lang="js" />,
      consent: <CodeBlock code={CONSENT_SNIPPET} lang="ts" />,
    },
    security: {
      csp: (
        <>
          <CodeBlock code={CSP_HEADER} lang="bash" />
          <CodeBlock code={NONCE_SNIPPET} lang="ts" />
        </>
      ),
      sri: (
        <>
          <CodeBlock code={CDN_TAG_PINNED} lang="html" />
          <CodeBlock code={SRI_SNIPPET} lang="bash" />
        </>
      ),
    },
  };
}

/** One guide's sections: each has a title, rich text, an optional list (`items`) and the extras above. */
function GuideBody({ slug }: { slug: GuideSlug }) {
  const t = useTranslations("Guides");
  const extras = useExtras()[slug] ?? {};
  const r = (key: string) => t.rich(key, rich);
  return (
    <>
      <p>{r(`${slug}.intro`)}</p>
      {GUIDE_SECTIONS[slug].map((id) => {
        const base = `${slug}.sections.${id}`;
        const items = t.has(`${base}.items`) ? (t.raw(`${base}.items`) as unknown[]) : [];
        return (
          <DocSection key={id} id={id} title={t(`${base}.title`)}>
            <p>{r(`${base}.text`)}</p>
            {items.length ? (
              <ul className="space-y-3">
                {items.map((_, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-teal"
                    />
                    <span className="min-w-0">{r(`${base}.items.${i}`)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {extras[id]}
          </DocSection>
        );
      })}
      {t.has(`${slug}.note`) ? (
        <Callout title={t(`${slug}.noteTitle`)} className="mt-12">
          {r(`${slug}.note`)}
        </Callout>
      ) : null}
    </>
  );
}

const ICONS: Record<GuideSlug, LucideIcon> = {
  theming: Palette,
  languages: Languages,
  controls: SlidersHorizontal,
  accessibility: Accessibility,
  privacy: Lock,
  security: ShieldCheck,
  limitations: Ban,
};

/** Guides page: a card for every guide. */
export function GuideCards() {
  const t = useTranslations("Guides");
  return (
    <ul role="list" className="grid gap-4 sm:grid-cols-2 md:gap-6">
      {GUIDES.map((g) => {
        const Icon = ICONS[g.slug];
        return (
          <li key={g.slug} className="flex">
            <Link
              href={`/guides/${g.slug}/`}
              className="group flex h-full w-full flex-col gap-4 rounded-3xl border bg-card p-6 transition-colors duration-150 hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-link ring-1 ring-primary/20">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
              </span>
              <h2 className="text-h3">{t(`${g.slug}.title`)}</h2>
              <span className="text-small text-muted-foreground">{t(`${g.slug}.summary`)}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 text-small font-bold text-link">
                {t("read")}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** One guide's page body. Block-level siblings are 24px apart; each h2 section brings its own 48px. */
export function GuidePage({ guide }: { guide: Guide }) {
  return (
    <div className="space-y-6">
      <GuideBody slug={guide.slug} />
    </div>
  );
}
