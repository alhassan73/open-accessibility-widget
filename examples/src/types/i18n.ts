import type { routing } from "@/i18n/routing";

/** A language the site is available in. */
export type Locale = (typeof routing.locales)[number];
/** Text direction. */
export type Dir = "ltr" | "rtl";
