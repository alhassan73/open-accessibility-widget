import { ArrowRight, Check, ExternalLink, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { siNpm } from "simple-icons";
import { CodeTabs } from "@/components/code/CodeTabs";
import { DocSection } from "@/components/layout/DocSection";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FRAMEWORKS } from "@/content/frameworks";
import { Link } from "@/i18n/navigation";
import { npmUrl, PKG } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Framework } from "@/types";
import { Callout } from "./Callout";
import { FrameworkLogo } from "./FrameworkLogo";
import { Reveal } from "./Reveal";
import { rich } from "./Rich";
import { Section, SectionHeading } from "./SectionShell";

const tile =
  "group flex h-full rounded-2xl border bg-card transition-colors duration-150 hover:border-primary/40 hover:bg-accent/40";
const logoBox = "grid size-12 shrink-0 place-items-center rounded-xl border bg-background";

/** Home page: a logo grid that links to each framework's page. */
export function FrameworkGrid() {
  const t = useTranslations("Frameworks");
  const pages = useTranslations("Pages");
  return (
    <Section id="frameworks" labelledBy="frameworks-title">
      <SectionHeading
        id="frameworks"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<Layers aria-hidden="true" />}
      />
      <ul role="list" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
        {FRAMEWORKS.map((fw, i) => (
          <Reveal as="li" key={fw.slug} delay={(i % 3) * 40} className="flex">
            <Link
              href={`/frameworks/${fw.slug}/`}
              className={cn(tile, "w-full items-center gap-3 p-4")}
            >
              <span className={logoBox}>
                <FrameworkLogo slug={fw.slug} decorative className="size-7" />
              </span>
              <span className="min-w-0 text-body font-bold text-foreground">
                {t(`items.${fw.slug}.name`)}
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <Link href="/frameworks/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          {pages("allFrameworks")}
          <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
        </Link>
      </div>
    </Section>
  );
}

/** Frameworks page: a card for every framework. */
export function FrameworkCards() {
  const t = useTranslations("Frameworks");
  return (
    // Two columns: with the docs sidebar beside them, three would be too narrow until 2xl.
    <ul role="list" className="grid gap-4 sm:grid-cols-2 md:gap-6 2xl:grid-cols-3">
      {FRAMEWORKS.map((fw) => (
        <li key={fw.slug} className="flex">
          <Link href={`/frameworks/${fw.slug}/`} className={cn(tile, "w-full flex-col gap-4 p-6")}>
            <span className="flex items-center gap-4">
              <span className={logoBox}>
                <FrameworkLogo slug={fw.slug} decorative className="size-7" />
              </span>
              <h2 className="min-w-0 text-h3">{t(`items.${fw.slug}.name`)}</h2>
            </span>
            <span className="text-small text-muted-foreground">
              {t.rich(`items.${fw.slug}.blurb`, rich)}
            </span>
            <span className="mt-auto inline-flex items-center gap-1.5 text-small font-bold text-link">
              {t("open")}
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** One framework's page: install, usage snippets and notes. */
export function FrameworkDetail({ fw }: { fw: Framework }) {
  const t = useTranslations("Frameworks");
  const item = "items." + fw.slug;
  const notes = (t.raw(item + ".notes") as unknown[]).length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 text-small">
        <span className="text-muted-foreground">{t("package")}</span>
        <a
          href={npmUrl(PKG)}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-background px-3 py-1.5 font-mono text-mono text-foreground transition-colors duration-150 hover:border-primary/50 hover:bg-accent"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="size-4 shrink-0 fill-[#cb3837]"
          >
            <path d={siNpm.path} />
          </svg>
          {PKG}
          <ExternalLink aria-hidden="true" className="size-3.5 text-muted-foreground" />
          <span className="sr-only">{t("newTab")}</span>
        </a>
        {fw.requires ? (
          <Badge variant="outline" className="text-muted-foreground">
            {t.rich("requires", {
              version: fw.requires,
              ltr: (chunks) => <bdi dir="ltr">{chunks}</bdi>,
            })}
          </Badge>
        ) : null}
      </div>

      {/* The package row above it stands in for a rule. */}
      <DocSection id="install" title={t("installTitle")} className="mt-8 border-t-0 pt-0">
        <CodeTabs items={fw.install} label={t("installTitle")} />
      </DocSection>

      <DocSection id="usage" title={t("usageTitle")}>
        <CodeTabs
          label={t("usageTitle")}
          items={fw.snippets.map((s) => ({
            label: s.label ?? t(`${item}.snippets.${s.id}`),
            code: s.code,
            lang: s.lang,
          }))}
        />
      </DocSection>

      <DocSection id="notes" title={t("notes")}>
        <ul className="space-y-2.5">
          {Array.from({ length: notes }, (_, i) => (
            <li key={i} className="flex gap-2.5">
              <Check aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-brand-teal" />
              <span className="min-w-0">{t.rich(`${item}.notes.${i}`, rich)}</span>
            </li>
          ))}
        </ul>
        <Callout title={t("statementTitle")}>{t.rich("statement", rich)}</Callout>
      </DocSection>
    </>
  );
}
