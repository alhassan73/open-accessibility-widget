import type { Metadata } from "next";
import { NoFlashScript } from "@/components/layout/NoFlashScript";
import { Wordmark } from "@/components/layout/Wordmark";
import { buttonVariants } from "@/components/ui/button";
import { DIR, LOCALES } from "@/i18n/config";
import { routing } from "@/i18n/routing";
import { ALL_MESSAGES } from "@/i18n/static";
import { viewport as siteViewport } from "@/lib/seo";
import { fontVariables } from "./fonts";
import "./globals.css";

// One prerendered page serves every missing path, so the language is picked in the browser: the locale in the
// missing URL (/en/…, /ar/…), else the browser's language. Every language is in the HTML; the script shows the
// matching one and sets <html lang dir> and the title before the first paint. Without JavaScript the default
// language shows.
const LOCALE_SCRIPT =
  "(function(){try{" +
  `var L=${JSON.stringify(LOCALES)},D=${JSON.stringify(DIR)},l="${routing.defaultLocale}";` +
  'var p=location.pathname.split("/")[1];' +
  'if(L.indexOf(p)!==-1)l=p;else{var n=String((navigator.languages||[])[0]||navigator.language||"").slice(0,2).toLowerCase();if(L.indexOf(n)!==-1)l=n}' +
  'var d=document.documentElement;d.lang=l;d.dir=D[l];var s=document.querySelectorAll("[data-locale]");' +
  'for(var i=0;i!==s.length;i++){var on=s[i].getAttribute("data-locale")===l;s[i].hidden=!on;if(on)document.title=s[i].getAttribute("data-title")}' +
  "}catch(e){}})()";

export const metadata: Metadata = {
  title: ALL_MESSAGES[routing.defaultLocale].NotFound.title,
  robots: { index: false, follow: false },
};
export const viewport = siteViewport;

export default function GlobalNotFound() {
  return (
    <html
      lang={routing.defaultLocale}
      dir={DIR[routing.defaultLocale]}
      data-theme="dark"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <NoFlashScript />
      </head>
      <body>
        <main className="grid min-h-dvh place-items-center px-4 py-16">
          {LOCALES.map((locale) => {
            const t = ALL_MESSAGES[locale].NotFound;
            return (
              <section
                key={locale}
                data-locale={locale}
                data-title={t.title}
                lang={locale}
                dir={DIR[locale]}
                hidden={locale !== routing.defaultLocale}
                suppressHydrationWarning // the script switches `hidden` before hydration
                className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow-elevated sm:p-10"
              >
                <a
                  href={`/${locale}/`}
                  aria-label={`Open Accessibility Widget – ${t.home}`}
                  className="inline-flex rounded-lg p-1"
                >
                  <Wordmark />
                </a>
                <p
                  aria-hidden="true"
                  className="text-gradient mt-8 text-7xl leading-none font-extrabold"
                >
                  404
                </p>
                {/* Only one section is ever shown, so each has the page's h1. */}
                <h1 className="mt-6 text-2xl font-extrabold">{t.title}</h1>
                <p className="mt-2 text-muted-foreground">{t.body}</p>
                <a href={`/${locale}/`} className={buttonVariants({ className: "mt-5" })}>
                  {t.home}
                </a>
              </section>
            );
          })}
        </main>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_SCRIPT }} />
      </body>
    </html>
  );
}
