import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocsPage } from "@/components/layout/DocsLayout";
import { GuideCards } from "@/components/sections/Guides";
import { type LocaleParams, resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

const PATH = "guides/";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [pages, guides] = await Promise.all([
    getTranslations({ locale, namespace: "Pages" }),
    getTranslations({ locale, namespace: "Guides" }),
  ]);
  return buildMetadata(locale, PATH, {
    title: pages("guides.title"),
    description: guides("description"),
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [nav, guides] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Guides" }),
  ]);
  return (
    <DocsPage
      index
      path={PATH}
      crumbs={[{ name: nav("guides"), path: PATH }]}
      title={guides("title")}
      lead={guides("description")}
      source="examples/src/content/guides.ts"
    >
      <GuideCards />
    </DocsPage>
  );
}
