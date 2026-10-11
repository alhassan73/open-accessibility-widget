import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { ROUTES } from "@/lib/routes";
import { languageUrls } from "@/lib/seo";
import { pageUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: pageUrl(locale, path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "" ? (locale === "en" ? 1 : 0.9) : 0.7,
      alternates: { languages: languageUrls(path) },
    })),
  );
}
