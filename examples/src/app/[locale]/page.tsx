import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { HomePage } from "@/components/sections/HomePage";
import { type LocaleParams, resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return buildMetadata(await resolveLocale(params));
}

export default async function Page({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <>
      <JsonLd locale={locale} />
      <HomePage />
    </>
  );
}
