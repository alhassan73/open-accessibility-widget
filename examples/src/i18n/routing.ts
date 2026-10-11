import { defineRouting } from "next-intl/routing";

/** One page per language, always under its own prefix: /en/ and /ar/. The proxy sends "/" to one of them. */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});
