import { fileURLToPath } from "node:url";
import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// The site is an npm workspace: dependencies are hoisted to the repo root, and the widget is imported
// straight from ../src (tsconfig "paths"), so Turbopack must start at the repo root.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Security headers for every response. The pages are statically generated, so there is no per-request
 * nonce: inline scripts (Next's flight data, the theme script) are allowed with 'unsafe-inline', as the
 * Next.js docs recommend for static pages. Trusted Types still guards every DOM XSS sink; the widget
 * itself needs none (no innerHTML), and the "default" policy (TrustedTypesScript) only lets Next's own
 * chunk URLs through. Styles need 'unsafe-inline' for the widget's injected <style> and React style props.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
  "require-trusted-types-for 'script'",
  "trusted-types default nextjs#bundler 'allow-duplicates'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  typedRoutes: false,
  turbopack: { root: repoRoot },
  // The root layout is app/[locale]/layout.tsx, so a 404 outside a known language needs its own <html>.
  experimental: { globalNotFound: true },
  // The dev server's overlay and HMR use eval and inline scripts: the policy applies to production only.
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

// next-intl: translations come from messages/<locale>.json through src/i18n/request.ts.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(config);
