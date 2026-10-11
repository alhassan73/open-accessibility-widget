import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { NoFlashScript } from "@/components/layout/NoFlashScript";
import { SiteShell } from "@/components/layout/SiteShell";
import { TrustedTypesScript } from "@/components/layout/TrustedTypesScript";
import { DIR } from "@/i18n/config";
import { routing } from "@/i18n/routing";
import { buildSearchIndex } from "@/lib/search-index";
import { viewport as siteViewport } from "@/lib/seo";
import { fontVariables } from "../fonts";
import "../globals.css";

// Only these namespaces are used by client components, so only these are sent to the browser.
const CLIENT_NAMESPACES = [
  "Header",
  "Nav",
  "LanguageSwitch",
  "ThemeToggle",
  "CodeBlock",
  "Playground",
  "Search",
];

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

// Every page is prerendered in both languages (/en/..., /ar/...). Anything else is a 404 (global-not-found).
// Each page builds its own metadata (title, canonical, hreflang), see lib/seo.ts.
export const dynamicParams = false;
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));
export const viewport = siteViewport;

// This is a root layout: it renders <html> with the language and direction of the page. The theme attribute
// and the `js` class are set by NoFlashScript before first paint, so React must not complain about <html>
// differing from the server markup.
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Static rendering: next-intl reads the locale from here (the proxy never runs for prerendered pages).
  setRequestLocale(locale);
  const all = await getMessages();
  const messages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, all[ns]]));
  // The search index of this language, built while prerendering: the browser never fetches it.
  const searchIndex = buildSearchIndex(all);
  return (
    <html
      lang={locale}
      dir={DIR[locale]}
      data-theme="dark"
      // The page scrolls smoothly (globals.css); this tells Next.js to jump instantly on navigation.
      data-scroll-behavior="smooth"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <TrustedTypesScript />
        <NoFlashScript />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SiteShell searchIndex={searchIndex}>{children}</SiteShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
