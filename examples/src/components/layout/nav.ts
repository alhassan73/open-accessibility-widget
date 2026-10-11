import { PKG, REPO, STATEMENT_URL, npmUrl } from "@/lib/site";

/** Page width and side gutters; the same as the sections use, so header and footer line up with them. */
export const CONTAINER = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** The pages in the header and footer menus, in order. `key` is in the "Nav" messages; `href` has no language. */
export const PAGES = [
  { key: "home", href: "/" },
  { key: "gettingStarted", href: "/getting-started/" },
  { key: "frameworks", href: "/frameworks/" },
  { key: "api", href: "/api/" },
  { key: "guides", href: "/guides/" },
  { key: "changelog", href: "/changelog/" },
] as const;

/** Whether `pathname` (without the language) is the menu page `href` or one of its sub-pages. */
export function isCurrent(pathname: string, href: string) {
  const clean = (p: string) => p.replace(/\/+$/, "");
  return href === "/" ? clean(pathname) === "" : clean(pathname).startsWith(clean(href));
}

export const LINKS = {
  github: REPO,
  npm: npmUrl(PKG),
  changelog: `${REPO}/blob/main/CHANGELOG.md`,
  license: `${REPO}/blob/main/LICENSE`,
  security: `${REPO}/blob/main/SECURITY.md`,
  statement: STATEMENT_URL,
  issues: `${REPO}/issues`,
  author: "https://github.com/alhassan73",
} as const;
