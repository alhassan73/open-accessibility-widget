import type { Guide } from "@/types";

/** The guide pages, in menu order. The slug is also the guide's namespace in the messages (`Guides.<slug>`). */
export const GUIDES: Guide[] = [
  { slug: "theming" },
  { slug: "languages" },
  { slug: "controls" },
  { slug: "accessibility" },
  { slug: "privacy" },
  { slug: "security" },
  { slug: "limitations" },
];
