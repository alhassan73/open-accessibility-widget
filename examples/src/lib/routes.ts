import { FRAMEWORKS } from "@/content/frameworks";
import { GUIDES } from "@/content/guides";

/** Every page of the site, as the route after the language ("" is the home page). Used by the sitemap. */
export const ROUTES: string[] = [
  "",
  "getting-started/",
  "frameworks/",
  ...FRAMEWORKS.map((fw) => `frameworks/${fw.slug}/`),
  "api/",
  "guides/",
  ...GUIDES.map((g) => `guides/${g.slug}/`),
  "changelog/",
];
