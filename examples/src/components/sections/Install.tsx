import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code/CodeBlock";
import { CodeTabs } from "@/components/code/CodeTabs";
import { DocSection } from "@/components/layout/DocSection";
import { CDN_TAG_PINNED, PM_TABS } from "@/content/frameworks";
import { Link } from "@/i18n/navigation";
import { PKG } from "@/lib/site";
import { Callout } from "./Callout";
import { rich } from "./Rich";

const ADD_BUNDLER = `import { init } from "${PKG}";

// Once, in the browser, after the page loads. Calling it again replaces the widget.
const widget = init();`;

const ADD_CDN = `${CDN_TAG_PINNED}
<script>
  A11yWidget.init();
</script>`;

const ADD_REACT = `import { AccessibilityWidget } from "${PKG}/react";

export default function App() {
  return (
    <>
      <YourApp />
      <AccessibilityWidget />
    </>
  );
}`;

const CUSTOMIZE = `init({
  position: "right",                                   // "left" (default) or "right"
  theme: { primary: "#0f766e", onPrimary: "#ffffff" }, // your brand color
  icon: "/logo.svg",                                   // launcher logo
  language: "ar",                                      // start in Arabic (RTL)
  features: { hideImages: false },                     // remove controls you don't offer
});`;

const STATEMENT = `init({ statementUrl: "/accessibility" });`;

/** An inline link to another docs page, inside a translated message. */
const docLink = (href: string) => (chunks: ReactNode) => (
  <Link
    href={href}
    className="inline-flex items-center gap-1 font-bold text-link underline underline-offset-4 hover:text-foreground"
  >
    {chunks}
    <ArrowRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
  </Link>
);

/** Body of the Getting started page (the page header is rendered by the page). */
export function Install() {
  const t = useTranslations("Install");
  const s = (id: string) => ({
    id,
    title: t(`sections.${id}.title`),
    text: t.rich(`sections.${id}.text`, rich),
  });
  const install = s("install");
  const add = s("add");
  const customize = s("customize");
  const statement = s("statement");

  return (
    <>
      <DocSection id={install.id} step={1} title={install.title}>
        <p>{install.text}</p>
        <CodeTabs
          label={install.title}
          items={[...PM_TABS, { label: "CDN", lang: "html", code: CDN_TAG_PINNED }]}
        />
      </DocSection>

      <DocSection id={add.id} step={2} title={add.title}>
        <p>{add.text}</p>
        <CodeTabs
          label={add.title}
          items={[
            { label: t("tabs.bundler"), lang: "ts", code: ADD_BUNDLER },
            { label: t("tabs.cdn"), lang: "html", code: ADD_CDN },
            { label: "React / Next.js", lang: "tsx", code: ADD_REACT },
          ]}
        />
        <p className="text-small text-muted-foreground">
          {t.rich("frameworkText", { link: docLink("/frameworks/") })}
        </p>
      </DocSection>

      <DocSection id={customize.id} step={3} title={customize.title}>
        <p>{customize.text}</p>
        <CodeBlock code={CUSTOMIZE} lang="ts" />
        <p className="text-small text-muted-foreground">
          {t.rich("customizeMore", { link: docLink("/api/") })}
        </p>
      </DocSection>

      <DocSection id={statement.id} title={statement.title}>
        <p>{statement.text}</p>
        <CodeBlock code={STATEMENT} lang="ts" />
      </DocSection>

      <div className="mt-12 space-y-4">
        <Callout tone="security" title={t("complianceTitle")}>
          {t.rich("compliance", { ...rich, link: docLink("/guides/limitations/") })}
        </Callout>
        <Callout title={t("privacyTitle")}>
          {t.rich("privacy", { ...rich, link: docLink("/guides/privacy/") })}
        </Callout>
      </div>
    </>
  );
}
