import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { siGithub } from "simple-icons";
import { Link } from "@/i18n/navigation";
import { COPYRIGHT_YEAR } from "@/lib/site";
import { CONTAINER, LINKS, PAGES } from "./nav";
import { Wordmark } from "./Wordmark";

/** Guides to read before putting the widget on a site, in the "Before you ship" column. */
const SHIP_GUIDES = ["limitations", "privacy", "security"] as const;

const link =
  "inline-flex min-h-8 items-center gap-1 rounded-sm text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline";
const title = "mb-3 text-small font-bold text-foreground";
/** Inline link inside the credits line. */
const inline =
  "font-bold text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-link";

/** Inline, so a label that wraps keeps its arrow right after the last word. */
function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noreferrer" className={link.replace("inline-flex", "inline-block py-1.5 leading-5")}>
      {children}
      <ArrowUpRight aria-hidden="true" className="ms-1 inline size-3.5 align-[-0.125em] rtl:-scale-x-100" />
    </a>
  );
}

export function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const guides = useTranslations("Guides");
  const projectLinks = [
    { href: LINKS.github, label: "GitHub" },
    { href: LINKS.npm, label: "npm" },
    { href: LINKS.license, label: t("license") },
    { href: LINKS.security, label: t("security") },
    { href: LINKS.issues, label: t("issues") },
  ];
  const author = t("authorName");

  return (
    <footer className="border-t bg-card/40">
      <div
        className={`${CONTAINER} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]`}
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label={t("home")} className="-ms-1 inline-flex rounded-lg p-1">
            <Wordmark />
          </Link>
          <p className="mt-4 max-w-sm text-small text-muted-foreground">{t("about")}</p>
        </div>

        <nav aria-label={t("sections")}>
          <p className={title}>{t("sections")}</p>
          <ul className="grid gap-1 text-small">
            {PAGES.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className={link}>
                  {nav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("project")}>
          <p className={title}>{t("project")}</p>
          <ul className="grid gap-1 text-small">
            {projectLinks.map(({ href, label }) => (
              <li key={href}>
                <External href={href}>{label}</External>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("ship")}>
          <p className={title}>{t("ship")}</p>
          <ul className="grid gap-1 text-small">
            {SHIP_GUIDES.map((slug) => (
              <li key={slug}>
                <Link href={`/guides/${slug}/`} className={link}>
                  {guides(`${slug}.title`)}
                </Link>
              </li>
            ))}
            <li>
              <External href={LINKS.statement}>{t("statement")}</External>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t">
        {/* Extra room at the bottom on small screens: the widget's launcher sits in that corner. */}
        <div
          className={`${CONTAINER} flex flex-col items-center gap-3 pt-6 pb-24 text-center text-small text-muted-foreground lg:flex-row lg:justify-between lg:gap-8 lg:pb-6 lg:pe-24 lg:text-start xl:pe-0`}
        >
          <p className="text-balance">
            {t.rich("legal", {
              year: COPYRIGHT_YEAR,
              author,
              license: (chunks) => (
                <a href={LINKS.license} rel="noreferrer" className={inline}>
                  {chunks}
                </a>
              ),
            })}
          </p>
          {/* Stacked on small screens; one line with a separator next to the copyright on large ones. */}
          <div className="flex flex-col items-center gap-1 lg:shrink-0 lg:flex-row lg:gap-3">
            <p className="whitespace-nowrap">{t("notCompliance")}</p>
            <span aria-hidden="true" className="hidden lg:inline">
              ·
            </span>
            <p className="whitespace-nowrap">
              {t.rich("credit", {
                author,
                profile: (chunks) => (
                  <a
                    href={LINKS.author}
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-foreground underline-offset-4 transition-colors duration-150 hover:text-link hover:underline"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                      className="size-4 fill-current"
                    >
                      <path d={siGithub.path} />
                    </svg>
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
