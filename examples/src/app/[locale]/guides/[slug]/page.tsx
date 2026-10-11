import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DocsPage } from "@/components/layout/DocsLayout";
import { GuidePage } from "@/components/sections/Guides";
import { GUIDES } from "@/content/guides";
import { routing } from "@/i18n/routing";
import { resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  routing.locales.flatMap((locale) => GUIDES.map((g) => ({ locale, slug: g.slug })));

async function load({ params }: Props) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();
  const [pages, nav, guides] = await Promise.all([
    getTranslations({ locale, namespace: "Pages" }),
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Guides" }),
  ]);
  return {
    locale,
    guide,
    pages,
    nav,
    guides,
    title: guides(guide.slug + ".title"),
    summary: guides(guide.slug + ".summary"),
    path: "guides/" + guide.slug + "/",
  };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, pages, title, summary, path } = await load(props);
  return buildMetadata(locale, path, {
    title,
    description: pages("guide.description", { summary }),
  });
}

export default async function Page(props: Props) {
  const { guide, nav, title, summary, path } = await load(props);
  return (
    <DocsPage
      path={path}
      crumbs={[
        { name: nav("guides"), path: "guides/" },
        { name: title, path },
      ]}
      title={title}
      lead={summary}
      source="examples/messages/en.json"
    >
      <GuidePage guide={guide} />
    </DocsPage>
  );
}
