import type { Lang } from "./highlight";
import type { CodeTabItem } from "./ui";

export type FrameworkSlug =
  | "vanilla"
  | "react"
  | "next"
  | "vue"
  | "nuxt"
  | "angular"
  | "svelte"
  | "astro"
  | "cms";

export interface Snippet {
  /** Key of the tab. Its translated label is `Frameworks.items.<slug>.snippets.<id>` unless `label` is set. */
  id: string;
  /** Language-neutral tab label (a file name or a product name). */
  label?: string;
  lang: Lang;
  code: string;
}

/** Code and facts of one framework. Its name, blurb and notes are in the messages (`Frameworks.items.<slug>`). */
export interface Framework {
  slug: FrameworkSlug;
  /** English or brand name, used where the page shows the logos. */
  name: string;
  /** What to install: package-manager commands, or the CDN script tag. */
  install: CodeTabItem[];
  /** Peer requirement, e.g. "React 18+". */
  requires?: string;
  snippets: Snippet[];
}

/** One row of an API table. Its description is `Api.rows.<group>.<id>` in the messages. */
export interface ApiRow {
  id: string;
  name: string;
  type?: string;
  def?: string;
}

/** Tables of the API page: the keys of `Api.rows` in the messages, and the anchors of its sections. */
export type ApiGroup = "options" | "theme" | "methods" | "react" | "exports" | "settings" | "entries";

/** URL segment of a guide page; also its namespace in the messages (`Guides.<slug>`). */
export type GuideSlug =
  | "theming"
  | "languages"
  | "controls"
  | "accessibility"
  | "privacy"
  | "security"
  | "limitations";

export interface Guide {
  slug: GuideSlug;
}

/** One step of a page's breadcrumb trail. `path` is the route after the language ("" is the home page). */
export interface Crumb {
  name: string;
  path: string;
}
