import { hasLocale } from "next-intl";
import type { Dir, Locale } from "@/types";
import { routing } from "./routing";

export const LOCALES = routing.locales;
export const isLocale = (value: string): value is Locale => hasLocale(LOCALES, value);

export const DIR: Record<Locale, Dir> = { en: "ltr", ar: "rtl" };
/** Open Graph locale codes. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", ar: "ar_AR" };
