import type { MetadataRoute } from "next";
import { siteDescription } from "@/lib/seo";

export const dynamic = "force-static";

// Same-origin paths, so the manifest works on preview deployments and local builds too.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return {
    id: "/",
    name: "Open Accessibility Widget",
    short_name: "A11y Widget",
    description: await siteDescription("en"),
    lang: "en",
    dir: "ltr",
    start_url: "/en/",
    scope: "/",
    display: "browser",
    background_color: "#0e1111",
    theme_color: "#0e1111",
    categories: ["developer tools", "accessibility"],
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
