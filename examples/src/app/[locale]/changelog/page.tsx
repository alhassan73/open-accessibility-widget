import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocsPage } from "@/components/layout/DocsLayout";
import { Changelog } from "@/components/sections/Changelog";
import { readChangelog } from "@/lib/changelog";
import { type LocaleParams, resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

const PATH = "changelog/";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "Changelog" });
  return buildMetadata(locale, PATH, { title: t("title"), description: t("description") });
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [nav, t] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Changelog" }),
  ]);
  return (
    <DocsPage
      path={PATH}
      crumbs={[{ name: nav("changelog"), path: PATH }]}
      title={t("title")}
      lead={t("description")}
      source="CHANGELOG.md"
    >
      <Changelog releases={readChangelog()} />
    </DocsPage>
  );
}
