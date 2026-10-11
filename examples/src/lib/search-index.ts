// Search index of the docs, built while prerendering (in the layout) from the messages and the content tables.
// Only the current language is built and sent to the browser; nothing is fetched at runtime.
import { API_TABLES } from "@/content/api";
import { FRAMEWORKS } from "@/content/frameworks";
import { GUIDES } from "@/content/guides";
import { GUIDE_SECTIONS, START_SECTIONS } from "@/content/guide-sections";
import type { SearchEntry } from "@/types";

type Messages = Record<string, unknown>;

/** Longest summary kept per entry; the rest would only grow every page. */
const MAX_TEXT = 180;

/** The message at a dotted path, as plain text; `undefined` when the key is missing. */
function read(messages: Messages, path: string): string | undefined {
  let node: unknown = messages;
  for (const key of path.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return typeof node === "string" ? plain(node) : undefined;
}

/** ICU message to plain text: drops the rich-text tags and the ICU quoting around < > { }. */
export function plainText(message: string): string {
  return message
    .replace(/<\/?[a-z]+(?:\s[^>]*)?>/gi, "")
    .replace(/'([<>{}])'/g, "$1")
    .replace(/''/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** `plainText`, cut to MAX_TEXT characters at a word boundary. */
function plain(message: string): string {
  const text = plainText(message);
  if (text.length <= MAX_TEXT) return text;
  return text.slice(0, MAX_TEXT).replace(/\s+\S*$/, "") + "…";
}

export function buildSearchIndex(messages: Messages): SearchEntry[] {
  const m = (path: string) => read(messages, path);
  const out: SearchEntry[] = [];
  const add = (entry: Omit<SearchEntry, "title" | "text"> & { title?: string; text?: string }) => {
    if (entry.title) out.push({ ...entry, title: entry.title, text: entry.text ?? "" });
  };

  const start = m("Pages.gettingStarted.title");
  add({ href: "/getting-started/", title: start, text: m("Install.description"), group: "start" });
  for (const id of START_SECTIONS) {
    add({
      href: `/getting-started/#${id}`,
      title: m(`Install.sections.${id}.title`),
      text: m(`Install.sections.${id}.text`),
      group: "start",
      parent: start,
    });
  }

  const frameworks = m("Pages.frameworks.title");
  add({
    href: "/frameworks/",
    title: frameworks,
    text: m("Frameworks.description"),
    group: "frameworks",
  });
  for (const fw of FRAMEWORKS) {
    add({
      href: `/frameworks/${fw.slug}/`,
      title: m(`Frameworks.items.${fw.slug}.name`) ?? fw.name,
      text: m(`Frameworks.items.${fw.slug}.blurb`),
      group: "frameworks",
      keywords: fw.name,
    });
  }

  const api = m("Pages.api.title");
  add({ href: "/api/", title: api, text: m("Api.description"), group: "reference" });
  for (const [group, rows] of API_TABLES) {
    add({
      href: `/api/#${group}`,
      title: m(`Api.cards.${group}.title`),
      text: m(`Api.cards.${group}.description`),
      group: "reference",
      parent: api,
    });
    for (const row of rows) {
      add({
        href: `/api/#${group}`,
        title: row.name,
        text: m(`Api.rows.${group}.${row.id}`),
        group: "reference",
        parent: api,
        keywords: row.type,
      });
    }
  }

  const guides = m("Pages.guides.title");
  add({ href: "/guides/", title: guides, text: m("Guides.description"), group: "guides" });
  for (const { slug } of GUIDES) {
    const title = m(`Guides.${slug}.title`);
    add({ href: `/guides/${slug}/`, title, text: m(`Guides.${slug}.summary`), group: "guides" });
    for (const id of GUIDE_SECTIONS[slug]) {
      add({
        href: `/guides/${slug}/#${id}`,
        title: m(`Guides.${slug}.sections.${id}.title`),
        text: m(`Guides.${slug}.sections.${id}.text`),
        group: "guides",
        parent: title,
      });
    }
  }

  add({
    href: "/changelog/",
    title: m("Changelog.title"),
    text: m("Changelog.description"),
    group: "changelog",
  });
  return out;
}
