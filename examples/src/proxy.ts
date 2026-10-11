import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Sends a request without a language prefix to its language: the visitor's earlier choice (cookie), else the
 * browser's Accept-Language, else English. Pages under /en/ and /ar/ are prerendered, so they never run this.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except Next's own files, metadata routes and files with an extension (favicon.svg, banners).
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
