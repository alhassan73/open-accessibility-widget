import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DIR } from "@/i18n/config";
import type { SearchEntry } from "@/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SiteWidget } from "./SiteWidget";

/**
 * Page frame: skip link, sticky header, `<main id="main">`, footer and the accessibility widget. Provides the
 * Radix direction. The site has its own skip link, so the widget leaves out its "Skip to main content" link.
 */
export function SiteShell({
  children,
  searchIndex,
}: {
  children: ReactNode;
  searchIndex: SearchEntry[];
}) {
  const t = useTranslations("Shell");
  return (
    <TooltipProvider dir={DIR[useLocale()]}>
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100]"
      >
        {t("skip")}
      </a>
      <Header searchIndex={searchIndex} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <SiteWidget />
    </TooltipProvider>
  );
}
