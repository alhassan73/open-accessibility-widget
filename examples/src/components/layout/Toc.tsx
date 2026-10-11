"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Headings with an id inside the content column (DocsPage puts `id="docs-content"` on it). */
const HEADINGS = "#docs-content :is(h2, h3)[id]";
/** Where the current section starts, from the top of the viewport: the height of the header, plus room. */
const HEADER = 88;
/** Stable empty list, so the scroll-spy effect doesn't re-run on every render before the headings are read. */
const NONE: Heading[] = [];

/**
 * The page's h2/h3, read from the document once it is shown (their text comes from the page's own messages).
 * `null` until then, so the collapsible list can already take its place in the server HTML (no layout shift).
 */
function useHeadings() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[] | null>(null);
  useEffect(() => {
    setHeadings(
      Array.from(document.querySelectorAll<HTMLElement>(HEADINGS), (el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? "",
        level: el.tagName === "H3" ? 3 : 2,
      })),
    );
  }, [pathname]);
  return headings;
}

/** The id of the section being read: the last heading above 30% of the viewport (scroll-spy). */
function useActiveId(headings: Heading[]) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = headings.flatMap((h) => document.getElementById(h.id) ?? []);
    if (els.length < 2) return;
    const update = () => {
      const line = Math.max(HEADER, window.innerHeight * 0.3);
      let current = els[0]!;
      for (const el of els) {
        if (el.getBoundingClientRect().top > line) break;
        current = el;
      }
      setActive(current.id);
    };
    // A heading crossing the band (the top 30% of the viewport) is the moment the answer can change.
    const observer = new IntersectionObserver(update, { rootMargin: "0px 0px -70% 0px" });
    els.forEach((el) => observer.observe(el));
    // A short last section never reaches the line: the end of the page selects it.
    const onScroll = () => {
      const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (end) setActive(els[els.length - 1]!.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [headings]);
  return [active, setActive] as const;
}

const link =
  "block rounded-sm py-1.5 text-small text-muted-foreground transition-colors duration-150 hover:text-foreground aria-[current=location]:font-bold aria-[current=location]:text-link";

/**
 * "On this page": links to the page's sections. `aside` is the sticky column from `xl`; `inline` is a
 * collapsible list at the top of the content below that. Shows nothing for a page with fewer than 2 sections.
 */
export function Toc({
  title,
  variant,
}: {
  /** "On this page", translated; also the name of the navigation landmark. */
  title: string;
  variant: "aside" | "inline";
}) {
  const found = useHeadings();
  const headings = found ?? NONE;
  const [active, setActive] = useActiveId(headings);
  // The inline list is rendered before the headings are read (it is closed, so only its summary shows); the
  // sticky column has no neighbours to push, so it waits.
  if (found ? found.length < 2 : variant === "aside") return null;

  const list = (
    <ul className={variant === "aside" ? "border-s" : undefined}>
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            aria-current={variant === "aside" && active === h.id ? "location" : undefined}
            onClick={(e) => {
              setActive(h.id);
              // The menu closes once a section is chosen.
              e.currentTarget.closest("details")?.removeAttribute("open");
            }}
            className={cn(
              link,
              variant === "aside" &&
                "-ms-px border-s-2 border-transparent aria-[current=location]:border-link",
              h.level === 3 ? "ps-7" : "ps-4",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "inline")
    return (
      <details className="group mb-8 rounded-xl border bg-card xl:hidden">
        <summary className="flex min-h-11 list-none items-center justify-between gap-2 rounded-xl px-4 text-small font-bold text-foreground [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform duration-150 group-open:rotate-180"
          />
        </summary>
        <nav aria-label={title} className="px-2 pb-2">
          {list}
        </nav>
      </details>
    );

  return (
    <nav
      aria-label={title}
      className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto overscroll-contain px-2 pb-4 xl:block"
    >
      <p className="mb-2 ps-4 text-caption font-bold text-foreground">{title}</p>
      {list}
    </nav>
  );
}
