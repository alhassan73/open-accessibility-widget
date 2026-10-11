import type { GuideSlug } from "@/types";

/** Getting started: the ids of its h2 sections, which are also their keys in `Install.sections`. */
export const START_SECTIONS = ["install", "add", "customize", "statement"] as const;

/**
 * The h2 sections of each guide, in page order. Each id is the heading's anchor (short, English, never changes)
 * and the key of its title and text in the messages: `Guides.<slug>.sections.<id>.title` / `.text`.
 * The guide bodies (sections/Guides.tsx) and the search index both read this list.
 */
export const GUIDE_SECTIONS: Record<GuideSlug, readonly string[]> = {
  theming: ["colors", "css", "contrast", "logo", "placement"],
  languages: ["choose", "custom", "strings", "rtl"],
  controls: ["remove", "defaults", "profiles", "precedence"],
  accessibility: ["keyboard", "patterns", "testing"],
  privacy: ["network", "stored", "readers", "consent"],
  security: ["csp", "sri", "trusted-types"],
  limitations: ["markup", "reach", "display", "browsers"],
};
