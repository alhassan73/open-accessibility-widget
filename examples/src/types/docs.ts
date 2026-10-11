/** One page in the docs sidebar. `href` has no language ("/frameworks/vue/"). */
export interface DocsNavItem {
  href: string;
  /** Text in the sidebar. */
  label: string;
  /** Name in the previous/next cards when it differs from `label` (an "Overview" row names its section). */
  title?: string;
}

export interface DocsNavGroup {
  id: string;
  label: string;
  items: DocsNavItem[];
}
