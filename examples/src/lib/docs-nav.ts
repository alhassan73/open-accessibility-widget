import { useTranslations } from "next-intl";
import { FRAMEWORKS } from "@/content/frameworks";
import { GUIDES } from "@/content/guides";
import type { DocsNavGroup } from "@/types";

/**
 * The docs sidebar: its groups and pages in reading order. The previous/next cards follow the same order.
 * A hook (it reads the messages), so call it from a component.
 */
export function useDocsNav(): DocsNavGroup[] {
  const nav = useTranslations("Nav");
  const docs = useTranslations("Docs");
  const fws = useTranslations("Frameworks");
  const guides = useTranslations("Guides");
  return [
    {
      id: "start",
      label: docs("groups.start"),
      items: [{ href: "/getting-started/", label: nav("gettingStarted") }],
    },
    {
      id: "frameworks",
      label: docs("groups.frameworks"),
      items: [
        { href: "/frameworks/", label: docs("overview"), title: nav("frameworks") },
        ...FRAMEWORKS.map((fw) => ({
          href: `/frameworks/${fw.slug}/`,
          label: fws(`items.${fw.slug}.name`),
        })),
      ],
    },
    {
      id: "guides",
      label: docs("groups.guides"),
      items: [
        { href: "/guides/", label: docs("overview"), title: nav("guides") },
        ...GUIDES.map((g) => ({ href: `/guides/${g.slug}/`, label: guides(`${g.slug}.title`) })),
      ],
    },
    {
      id: "reference",
      label: docs("groups.reference"),
      items: [
        { href: "/api/", label: nav("api") },
        { href: "/changelog/", label: nav("changelog") },
      ],
    },
  ];
}
