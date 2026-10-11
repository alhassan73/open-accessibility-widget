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
      <HomePage />
      {/* After the content: Next.js scrolls to the top only when the page's first element is out of
          view, and a <script> has no box, so it always looks "in view". */}
      <JsonLd locale={locale} />
    </>
  );
}
