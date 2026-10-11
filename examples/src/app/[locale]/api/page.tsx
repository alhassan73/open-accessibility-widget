import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocsPage } from "@/components/layout/DocsLayout";
import { Api } from "@/components/sections/Api";
import { type LocaleParams, resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

const PATH = "api/";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [pages, api] = await Promise.all([
    getTranslations({ locale, namespace: "Pages" }),
    getTranslations({ locale, namespace: "Api" }),
  ]);
  return buildMetadata(locale, PATH, {
    title: pages("api.title"),
    description: api("description"),
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [nav, api] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Api" }),
  ]);
  return (
    <DocsPage
      path={PATH}
      crumbs={[{ name: nav("api"), path: PATH }]}
      title={api("title")}
      lead={api("description")}
      source="examples/src/content/api.ts"
    >
      <Api />
    </DocsPage>
  );
}
