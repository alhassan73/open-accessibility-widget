import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const OTHER: Record<Locale, Locale> = { en: "ar", ar: "en" };

/**
 * Link to the same page in the other language, named in that language. A plain <a> on purpose: the other
 * language is another document (<html lang dir>, the pre-paint theme script), so it is a full page load,
 * not a client-side navigation that would re-render the root layout in place.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations("LanguageSwitch");
  const target = OTHER[useLocale()];
  const path = getPathname({ href: usePathname(), locale: target });
  return (
    <a
      href={path.endsWith("/") ? path : `${path}/`}
      hrefLang={target}
      lang={target}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-small font-bold text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      <Languages aria-hidden="true" className="size-4" />
      {t(`names.${target}`)}
    </a>
  );
}
