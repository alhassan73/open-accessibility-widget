import type { Locale } from "@/types";

export const PKG = "open-accessibility-widget";
export const REPO = "https://github.com/alhassan73/open-accessibility-widget";
/** Public origin, with a trailing slash. */
export const SITE_URL = "https://open-accessibility-widget.vercel.app/";
export const OG_IMAGE = `${SITE_URL}social-preview.png`;
export const npmUrl = (pkg: string) => `https://www.npmjs.com/package/${pkg}`;
/** The widget's own accessibility statement (linked from the widget's footer on this site). */
export const STATEMENT_URL = `${REPO}/blob/main/ACCESSIBILITY.md`;

/** The published version the docs describe. Update on each release (with the CDN hash in content/frameworks.ts). */
export const VERSION = "1.2.0";

/**
 * Absolute URL of a page, used for canonical, hreflang, Open Graph, breadcrumbs and the sitemap.
 * `path` is the route after the language, with a trailing slash: "" (home), "api/", "frameworks/vue/".
 */
export const pageUrl = (locale: Locale, path = "") => new URL(`${locale}/${path}`, SITE_URL).href;

/** Absolute URL of a language's home page. */
export const localeUrl = (locale: Locale) => pageUrl(locale);

/** Year shown in the footer's copyright line (the year of the 1.0.0 release). */
export const COPYRIGHT_YEAR = 2026;
