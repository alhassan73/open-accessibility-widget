import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocsPage } from "@/components/layout/DocsLayout";
import { FrameworkCards } from "@/components/sections/Frameworks";
import { type LocaleParams, resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

const PATH = "frameworks/";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [pages, fw] = await Promise.all([
    getTranslations({ locale, namespace: "Pages" }),
    getTranslations({ locale, namespace: "Frameworks" }),
  ]);
  return buildMetadata(locale, PATH, {
    title: pages("frameworks.title"),
    description: fw("description"),
  });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [nav, fw] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Frameworks" }),
  ]);
  return (
    <DocsPage
      index
      path={PATH}
      crumbs={[{ name: nav("frameworks"), path: PATH }]}
      title={fw("title")}
      lead={fw("description")}
      source="examples/src/content/frameworks.ts"
    >
      <FrameworkCards />
    </DocsPage>
  );
}
