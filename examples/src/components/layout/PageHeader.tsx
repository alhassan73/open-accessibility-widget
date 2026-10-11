import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { breadcrumbLd } from "@/lib/seo";
import type { Crumb } from "@/types";
import { docsH1 } from "./docs-styles";
import { JsonLdScript } from "./JsonLd";

interface PageHeaderProps {
  /** Trail after "Home", ending with the page itself (e.g. Frameworks, Vue). */
  crumbs: Crumb[];
  /** The page's h1. */
  title: ReactNode;
  lead?: ReactNode;
  /** Shown beside the title (a logo). */
  mark?: ReactNode;
}

/** Top of the content column of a docs page: breadcrumb (with its JSON-LD), the h1 and a lead. */
export function PageHeader({ crumbs, title, lead, mark }: PageHeaderProps) {
  const t = useTranslations("Pages");
  const locale = useLocale();
  const trail: Crumb[] = [{ name: t("home"), path: "" }, ...crumbs];
  return (
    <header className="mb-10">
      <JsonLdScript data={breadcrumbLd(locale, trail)} />
      <nav aria-label={t("breadcrumb")}>
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-small text-muted-foreground">
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="font-bold text-foreground">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={`/${crumb.path}`}
                      className="inline-flex min-h-8 items-center rounded-sm underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
                    >
                      {crumb.name}
                    </Link>
                    <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-4 flex items-center gap-4">
        {mark ? (
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-card [&>svg]:size-7">
            {mark}
          </span>
        ) : null}
        <h1 className={docsH1}>{title}</h1>
      </div>
      {lead ? <p className="mt-4 text-lead text-muted-foreground">{lead}</p> : null}
    </header>
  );
}
