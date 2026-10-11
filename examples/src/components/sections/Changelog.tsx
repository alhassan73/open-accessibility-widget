import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";
import { docsH2 } from "@/components/layout/docs-styles";
import { LINKS } from "@/components/layout/nav";
import { Badge } from "@/components/ui/badge";
import { inlineParts } from "@/lib/changelog";
import { cn } from "@/lib/utils";
import type { ChangeItem, Release } from "@/types";

// Section kinds with their own label and dot color; any other kind shows its heading as written.
const KINDS: Record<string, string> = {
  added: "bg-brand-teal",
  changed: "bg-primary",
  fixed: "bg-amber-500",
  removed: "bg-destructive",
  deprecated: "bg-amber-500",
  security: "bg-destructive",
  internal: "bg-muted-foreground",
  size: "bg-brand-cyan",
};

/** Inline Markdown from the changelog, rendered as elements (never as HTML). */
function Inline({ text }: { text: string }) {
  return inlineParts(text).map((part, i) => {
    if (part.type === "code")
      return (
        <code
          key={i}
          dir="ltr"
          className="rounded-md border bg-code px-1.5 py-0.5 font-mono text-[0.88em] [overflow-wrap:anywhere]"
        >
          {part.value}
        </code>
      );
    if (part.type === "strong") return <strong key={i}>{part.value}</strong>;
    if (part.type === "link")
      return (
        <a
          key={i}
          href={part.href}
          rel="noreferrer"
          className="font-bold text-link underline underline-offset-4"
        >
          {part.value}
        </a>
      );
    return <Fragment key={i}>{part.value}</Fragment>;
  });
}

function Item({ item }: { item: ChangeItem }) {
  return (
    <li className="ps-1">
      <Inline text={item.text} />
      {item.children.length ? (
        <ul className="mt-2 list-[circle] space-y-1.5 ps-5">
          {item.children.map((child, i) => (
            <li key={i} className="ps-1">
              <Inline text={child} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Every release in CHANGELOG.md, newest first. The notes are written in English. */
export function Changelog({ releases }: { releases: Release[] }) {
  const t = useTranslations("Changelog");
  const locale = useLocale();
  const latest = releases.find((r) => !r.unreleased);
  // The release notes are English: mark them so on other pages (screen readers, fonts, direction).
  const notesLang = locale === "en" ? undefined : "en";

  return (
    <>
      {notesLang ? (
        <p className="mb-12 rounded-xl border bg-card px-5 py-4 text-small text-muted-foreground">
          {t("englishNote")}
        </p>
      ) : null}

      {releases.map((release) => (
        <article
          key={release.id}
          id={release.id}
          aria-labelledby={`${release.id}-title`}
          className="mt-12 border-t pt-10 first:mt-0 first:border-t-0 first:pt-0"
        >
          <header className="flex flex-wrap items-center gap-3">
            <h2 id={`${release.id}-title`} className={docsH2}>
              {release.unreleased ? (
                t("unreleased")
              ) : (
                <bdi dir="ltr" className="tabular-nums">
                  {release.version}
                </bdi>
              )}
            </h2>
            {release === latest ? <Badge>{t("latest")}</Badge> : null}
            {release.unreleased ? <Badge variant="outline">{t("upcoming")}</Badge> : null}
          </header>

          <div lang={notesLang} dir={notesLang ? "ltr" : undefined}>
            {release.intro.map((paragraph, i) => (
              <p key={i} className="mt-4 text-muted-foreground">
                <Inline text={paragraph} />
              </p>
            ))}

            {release.sections.map((section) => {
              // "Changed — design": a known kind, then an English qualifier.
              const [kind = "", ...rest] = section.kind.split(" — ");
              const qualifier = rest.join(" — ");
              const known = kind in KINDS;
              return (
              <section key={section.kind} className="mt-6">
                <h3 className="flex flex-wrap items-center gap-2 text-small font-bold">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 rounded-full", KINDS[kind] ?? "bg-muted-foreground")}
                  />
                  {/* The kind label follows the page language; the qualifier is from the English notes. */}
                  <span lang={locale} dir={notesLang ? "auto" : undefined}>
                    {known ? t(`kinds.${kind}`) : section.kind}
                  </span>
                  {known && qualifier ? (
                    <span lang="en" dir="ltr" className="font-normal text-muted-foreground">
                      {qualifier}
                    </span>
                  ) : null}
                </h3>
                <ul className="mt-3 list-disc space-y-2.5 ps-5 text-small marker:text-muted-foreground">
                  {section.items.map((item, i) => (
                    <Item key={i} item={item} />
                  ))}
                </ul>
              </section>
              );
            })}
          </div>
        </article>
      ))}

      <p className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-small">
        <a
          href={LINKS.changelog}
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-bold text-link underline underline-offset-4"
        >
          {t("source")}
          <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
        </a>
        <a
          href={`${LINKS.npm}?activeTab=versions`}
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-bold text-link underline underline-offset-4"
        >
          {t("npmVersions")}
          <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
        </a>
      </p>
    </>
  );
}
