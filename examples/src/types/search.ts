/** Heading a search result is listed under. Its label is `Search.groups.<group>` in the messages. */
export type SearchGroup = "start" | "frameworks" | "guides" | "reference" | "changelog";

/** One searchable item of one language: a docs page, or a section / API entry inside a page. */
export interface SearchEntry {
  /** Route without the language, with an optional `#anchor` ("/api/#options"). */
  href: string;
  title: string;
  /** Short plain-text summary, shown under the title and searched. */
  text: string;
  group: SearchGroup;
  /** Title of the page a section belongs to. Absent on the page entries themselves. */
  parent?: string;
  /** Extra words that are searched but not shown (package names, command names). */
  keywords?: string;
}
