import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";
import { OG_LOCALE } from "@/i18n/config";
import {
  COPYRIGHT_YEAR,
  OG_IMAGE,
  PKG,
  REPO,
  SITE_URL,
  VERSION,
  npmUrl,
  pageUrl,
} from "@/lib/site";
import type { Crumb, Locale } from "@/types";

const NAME = "Open Accessibility Widget";
const AUTHOR = { name: "Alhassan Ahmed", url: "https://github.com/alhassan73" };
const LICENSE_URL = "https://opensource.org/licenses/MIT";

/** The page's description in one language, from the messages. */
export const siteDescription = async (locale: Locale) =>
  (await getTranslations({ locale, namespace: "Metadata" }))("description");

/**
 * Every URL a page can be reached at, for canonical, hreflang and the sitemap. x-default is the English page:
 * the bare site root redirects by language, so it is not a page of its own. `path` is the route after the
 * language ("" is the home page).
 */
export const languageUrls = (path = "") => ({
  en: pageUrl("en", path),
  ar: pageUrl("ar", path),
  "x-default": pageUrl("en", path),
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e1111" },
    { media: "(prefers-color-scheme: light)", color: "#f6f8f8" },
  ],
  colorScheme: "dark light",
};

/**
 * Metadata of one page. `path` is the route after the language ("" is the home page, "frameworks/vue/" a
 * framework). Without `page` the page is the home page and uses the site title and description.
 */
export async function buildMetadata(
  locale: Locale,
  path = "",
  page?: { title: string; description: string },
): Promise<Metadata> {
  const m = await getTranslations({ locale, namespace: "Metadata" });
  const t = {
    title: page ? `${page.title} · ${NAME}` : m("title"),
    description: page?.description ?? m("description"),
    keywords: m.raw("keywords") as string[],
    ogAlt: m("ogAlt"),
  };
  const other: Locale = locale === "en" ? "ar" : "en";
  const url = pageUrl(locale, path);
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: t.title },
    description: t.description,
    applicationName: NAME,
    keywords: t.keywords,
    authors: [AUTHOR],
    creator: AUTHOR.name,
    publisher: AUTHOR.name,
    category: "technology",
    alternates: { canonical: url, languages: languageUrls(path) },
    openGraph: {
      type: "website",
      url,
      siteName: NAME,
      title: t.title,
      description: t.description,
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[other]],
      images: [{ url: OG_IMAGE, width: 1280, height: 640, alt: t.ogAlt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [{ url: OG_IMAGE, alt: t.ogAlt }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: ["/favicon.svg"] },
    // Same-origin path: the CSP's default-src 'self' covers manifest-src, so an absolute production URL would
    // be blocked on preview deployments and local builds.
    manifest: "/manifest.webmanifest",
  };
}

/** schema.org graph for the page, rendered by <JsonLd>. */
export async function jsonLd(locale: Locale) {
  const t = { description: await siteDescription(locale) };
  const url = pageUrl(locale);
  const author = { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url };
  const copyright = { copyrightHolder: author, copyrightYear: COPYRIGHT_YEAR };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        url,
        name: NAME,
        description: t.description,
        inLanguage: locale,
        publisher: author,
        ...copyright,
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#source`,
        name: NAME,
        description: t.description,
        codeRepository: REPO,
        programmingLanguage: "TypeScript",
        license: LICENSE_URL,
        runtimePlatform: "Web browser",
        version: VERSION,
        author,
        ...copyright,
        inLanguage: locale,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#software`,
        name: NAME,
        description: t.description,
        url,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        softwareVersion: VERSION,
        downloadUrl: npmUrl(PKG),
        license: LICENSE_URL,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author,
        ...copyright,
        sameAs: [REPO, npmUrl(PKG)],
      },
    ],
  };
}

/** BreadcrumbList for a page: `crumbs` run from the home page to the page itself. */
export function breadcrumbLd(locale: Locale, crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: pageUrl(locale, crumb.path),
    })),
  };
}
