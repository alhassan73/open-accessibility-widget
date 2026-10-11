import { API_TABLES } from "@/content/api";
import { FRAMEWORKS } from "@/content/frameworks";
import { GUIDES } from "@/content/guides";
import { ALL_MESSAGES } from "@/i18n/static";
import { plainText } from "@/lib/search-index";
import { PKG, REPO, VERSION, npmUrl, pageUrl } from "@/lib/site";

// /llms.txt (https://llmstxt.org): a Markdown map of the docs for language models, built at build time from
// the same messages and content tables as the pages, so it never drifts from them. English first; the Arabic
// pages are listed under "Optional".
export const dynamic = "force-static";

const en = ALL_MESSAGES.en;
const ar = ALL_MESSAGES.ar;
const link = (title: string, url: string, note?: string) =>
  `- [${title}](${url})${note ? `: ${plainText(note)}` : ""}`;

function build(): string {
  const lines: string[] = [
    "# Open Accessibility Widget",
    "",
    `> ${plainText(en.Metadata.description)}`,
    "",
    `Package \`${PKG}\` (v${VERSION}, MIT, no runtime dependencies). Install with \`npm install ${PKG}\`, ` +
      "then call `init(options)` once in the browser, or render `<AccessibilityWidget />` from " +
      `\`${PKG}/react\`. A script-tag build exposes \`window.A11yWidget\`.`,
    "",
    // BR-001: say what the widget is not, where tools that summarise the project will read it.
    `Important: ${plainText(en.Install.compliance).replace(/\s*Read the limitations$/, "")}`,
    "",
    "## Docs",
    "",
    link(en.Install.title, pageUrl("en", "getting-started/"), en.Install.description),
    link(en.Api.title, pageUrl("en", "api/"), en.Api.description),
    link(en.Changelog.title, pageUrl("en", "changelog/"), en.Changelog.description),
    "",
    "## Frameworks",
    "",
    ...FRAMEWORKS.map((fw) =>
      link(
        en.Frameworks.items[fw.slug].name,
        pageUrl("en", `frameworks/${fw.slug}/`),
        en.Frameworks.items[fw.slug].blurb,
      ),
    ),
    "",
    "## Guides",
    "",
    ...GUIDES.map((g) =>
      link(en.Guides[g.slug].title, pageUrl("en", `guides/${g.slug}/`), en.Guides[g.slug].summary),
    ),
    "",
    "## API sections",
    "",
    ...API_TABLES.map(([group]) =>
      link(en.Api.cards[group].title, `${pageUrl("en", "api/")}#${group}`, en.Api.cards[group].description),
    ),
    "",
    "## Optional",
    "",
    link("Source code (GitHub)", REPO),
    link("npm package", npmUrl(PKG)),
    link("Accessibility statement of the widget", `${REPO}/blob/main/ACCESSIBILITY.md`),
    link(`${ar.Pages.home} (Arabic docs)`, pageUrl("ar")),
    link(`${ar.Install.title} (Arabic)`, pageUrl("ar", "getting-started/")),
    link(`${ar.Api.title} (Arabic)`, pageUrl("ar", "api/")),
    "",
  ];
  return lines.join("\n");
}

export function GET() {
  return new Response(build(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
