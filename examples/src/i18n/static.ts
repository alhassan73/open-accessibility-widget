import type { Locale } from "@/types";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

/**
 * Both message files, for the one page that has no locale of its own (the global 404). Everything else gets
 * its messages from next-intl.
 */
export const ALL_MESSAGES: Record<Locale, typeof en> = { en, ar };
