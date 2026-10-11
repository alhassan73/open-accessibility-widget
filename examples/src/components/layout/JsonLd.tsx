import { jsonLd } from "@/lib/seo";
import type { Locale } from "@/types";

/**
 * Any schema.org data as a JSON-LD script. "<" becomes the JSON escape \u003c, so the data can never close the
 * script element and the text has no markup (the Trusted Types default policy only lets markup-free text through).
 */
export function JsonLdScript({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** The site's schema.org graph (home page). */
export async function JsonLd({ locale }: { locale: Locale }) {
  return <JsonLdScript data={await jsonLd(locale)} />;
}
