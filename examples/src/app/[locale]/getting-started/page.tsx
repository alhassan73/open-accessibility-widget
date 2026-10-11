import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocsPage } from "@/components/layout/DocsLayout";
import { Install } from "@/components/sections/Install";
import { type LocaleParams, resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

const PATH = "getting-started/";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [pages, install] = await Promise.all([
    getTranslations({ locale, namespace: "Pages" }),
    getTranslations({ locale, namespace: "Install" }),
  ]);
  return buildMetadata(locale, PATH, {
    title: pages("gettingStarted.title"),
    description: install("description"),
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [nav, install] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Install" }),
  ]);
  return (
    <DocsPage
      path={PATH}
      crumbs={[{ name: nav("gettingStarted"), path: PATH }]}
      title={install("title")}
      lead={install("description")}
      source="examples/messages/en.json"
    >
      <Install />
    </DocsPage>
  );
}
