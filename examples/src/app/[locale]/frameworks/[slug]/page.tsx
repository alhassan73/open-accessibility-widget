import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DocsPage } from "@/components/layout/DocsLayout";
import { FrameworkDetail } from "@/components/sections/Frameworks";
import { FrameworkLogo } from "@/components/sections/FrameworkLogo";
import { rich } from "@/components/sections/Rich";
import { FRAMEWORKS } from "@/content/frameworks";
import { routing } from "@/i18n/routing";
import { resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  routing.locales.flatMap((locale) => FRAMEWORKS.map((fw) => ({ locale, slug: fw.slug })));

async function load({ params }: Props) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const fw = FRAMEWORKS.find((f) => f.slug === slug);
  if (!fw) notFound();
  const [pages, nav, fws] = await Promise.all([
    getTranslations({ locale, namespace: "Pages" }),
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Frameworks" }),
  ]);
  const name = fws("items." + fw.slug + ".name");
  return { locale, fw, pages, nav, fws, name, path: "frameworks/" + fw.slug + "/" };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, pages, name, path } = await load(props);
  return buildMetadata(locale, path, {
    title: pages("framework.title", { name }),
    description: pages("framework.description", { name }),
  });
}

export default async function Page(props: Props) {
  const { fw, nav, fws, name, path } = await load(props);
  return (
    <DocsPage
      path={path}
      crumbs={[
        { name: nav("frameworks"), path: "frameworks/" },
        { name, path },
      ]}
      title={name}
      lead={fws.rich("items." + fw.slug + ".blurb", rich)}
      mark={<FrameworkLogo slug={fw.slug} decorative />}
      source="examples/src/content/frameworks.ts"
    >
      <FrameworkDetail fw={fw} />
    </DocsPage>
  );
}
