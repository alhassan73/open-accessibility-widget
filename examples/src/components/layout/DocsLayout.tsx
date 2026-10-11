import { SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useDocsNav } from "@/lib/docs-nav";
import { REPO } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Crumb } from "@/types";
import { DOCS_CONTAINER } from "./docs-styles";
import { DocsSidebar } from "./DocsSidebar";
import { MobileDocsBar } from "./MobileDocsBar";
import { PageHeader } from "./PageHeader";
import { Pager } from "./Pager";
import { Toc } from "./Toc";

interface DocsPageProps {
  /** Route after the language ("frameworks/vue/"): marks the page in the sidebar and finds its neighbours. */
  path: string;
  crumbs: Crumb[];
  /** The page's h1. */
  title: string;
  lead?: ReactNode;
  /** A logo beside the title. */
  mark?: ReactNode;
  /** File in the repository that holds the page's content, for "Edit this page" (e.g. "CHANGELOG.md"). */
  source: string;
  /** An index page (a card grid): the full column width, and no "On this page" list. */
  index?: boolean;
  children: ReactNode;
}

/**
 * Frame of every docs page. Three columns from `xl`: the docs sidebar (240px), the content (prose up to 720px)
 * and "On this page" (220px). The sidebar stays from `lg`; below that a bar under the header opens it in a sheet.
 */
export function DocsPage({
  path,
  crumbs,
  title,
  lead,
  mark,
  source,
  index = false,
  children,
}: DocsPageProps) {
  const t = useTranslations("Docs");
  const pages = useTranslations("Pages");
  const groups = useDocsNav();
  const flat = groups.flatMap((g) => g.items);
  const at = flat.findIndex((it) => it.href === `/${path}`);
  const sidebar = <DocsSidebar label={t("sidebar")} groups={groups} current={path} />;

  return (
    <>
      <MobileDocsBar
        title={title}
        menuLabel={t("menu")}
        sheetTitle={t("sidebar")}
        sheetDescription={t("menuDescription")}
        closeLabel={t("close")}
      >
        {sidebar}
      </MobileDocsBar>

      <div
        className={cn(
          DOCS_CONTAINER,
          "grid gap-x-10 pt-8 pb-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:pt-12 lg:pb-28 xl:gap-x-12 2xl:gap-x-16",
          !index && "xl:grid-cols-[15rem_minmax(0,1fr)_13.75rem]",
        )}
      >
        {/* Padding on the sides keeps the focus ring of a link from being cut off by the scroll area. */}
        <aside className="sticky top-20 -mx-2 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto overscroll-contain px-2 pb-4 lg:block">
          {sidebar}
        </aside>

        <article className="min-w-0">
          <div className={index ? undefined : "max-w-180"}>
            <PageHeader crumbs={crumbs} title={title} lead={lead} mark={mark} />
            {index ? null : <Toc title={t("toc")} variant="inline" />}
            <div id="docs-content">{children}</div>

            <p className="mt-16">
              <a
                href={`${REPO}/edit/main/${source}`}
                rel="noreferrer"
                className="inline-flex min-h-8 items-center gap-2 rounded-sm text-small text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
              >
                <SquarePen aria-hidden="true" className="size-4" />
                {t("edit")}
              </a>
            </p>
            <div className="mt-6">
              <Pager
                label={t("pager")}
                prevLabel={pages("prev")}
                nextLabel={pages("next")}
                prev={flat[at - 1]}
                next={flat[at + 1]}
              />
            </div>
          </div>
        </article>

        {index ? null : <Toc title={t("toc")} variant="aside" />}
      </div>
    </>
  );
}
