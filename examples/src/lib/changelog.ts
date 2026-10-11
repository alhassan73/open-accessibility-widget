import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ChangeSection, Release } from "@/types";

/**
 * Reads the repository's CHANGELOG.md at build time (the page is prerendered, so this runs once per build) and
 * parses the small Markdown subset it uses: "## version", "### Kind", paragraphs, and "- " list items with
 * one level of "  - " children. Inline Markdown stays in the strings; `inlineParts` splits it for rendering.
 */
export function readChangelog(): Release[] {
  // `next build` and `next dev` run in examples/; the changelog is at the repository root. The changelog page
  // is prerendered, so this runs at build time (Vercel builds from the whole repository, not just examples/).
  const source = readFileSync(join(process.cwd(), "..", "CHANGELOG.md"), "utf8");
  const releases: Release[] = [];
  let release: Release | undefined;
  let section: ChangeSection | undefined;

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trimEnd();
    const version = /^## (.+)$/.exec(line);
    const kind = /^### (.+)$/.exec(line);
    if (version) {
      const name = version[1]!.trim();
      const unreleased = /^unreleased$/i.test(name);
      release = {
        version: name,
        id: unreleased ? "unreleased" : `v${name.replace(/[^0-9a-z]+/gi, "-")}`,
        unreleased,
        intro: [],
        sections: [],
      };
      section = undefined;
      releases.push(release);
    } else if (!release) {
      continue; // the title and the introduction above the first release
    } else if (kind) {
      section = { kind: kind[1]!.trim().toLowerCase(), items: [] };
      release.sections.push(section);
    } else if (/^ {2,}- /.test(line) && section?.items.length) {
      section.items.at(-1)!.children.push(line.replace(/^ +- /, ""));
    } else if (line.startsWith("- ") && section) {
      section.items.push({ text: line.slice(2), children: [] });
    } else if (line.trim() && !section) {
      release.intro.push(line.trim());
    }
  }
  return releases;
}

export type InlinePart =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; value: string }
  | { type: "link"; value: string; href: string };

/** Splits inline Markdown (`code`, **bold**, [text](https://…)) into parts, so it renders without HTML. */
export function inlineParts(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    if (match[1] !== undefined) parts.push({ type: "code", value: match[1] });
    else if (match[2] !== undefined) parts.push({ type: "strong", value: match[2] });
    else parts.push({ type: "link", value: match[3]!, href: match[4]! });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}
