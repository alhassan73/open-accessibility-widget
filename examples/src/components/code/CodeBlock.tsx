import { Fragment } from "react";

import { CopyButton } from "@/components/code/CopyButton";
import { tokenize } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import type { Lang } from "@/types";

const LABEL: Record<Lang, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  html: "HTML",
  vue: "Vue",
  svelte: "Svelte",
  astro: "Astro",
  css: "CSS",
  bash: "Terminal",
  json: "JSON",
};

type Props = {
  code: string;
  lang: Lang;
  /** Label of the title bar (a file name, say); the language name when omitted. */
  title?: string;
  /** No bar, border or radius, for blocks that sit under another block's bar (see CodeTabs). */
  flush?: boolean;
  /** Caps the height: the code region itself scrolls (and is focusable), so keyboard users can reach all of it. */
  maxHeight?: boolean;
  className?: string;
};

/** A highlighted code block. Server component: tokens are rendered on the server, only the copy button is client code. */
export function CodeBlock({
  code,
  lang,
  title,
  flush = false,
  maxHeight = false,
  className,
}: Props) {
  const text = code.replace(/\n+$/, "");
  const lines = tokenize(text, lang);
  const label = title ?? LABEL[lang];
  return (
    <figure
      dir="ltr"
      lang="en"
      className={cn(
        "m-0 min-w-0 overflow-hidden bg-code text-start text-code-foreground [font-variant-ligatures:none]",
        !flush && "rounded-[12px] border border-code-border",
        className,
      )}
    >
      {/* One bar per block: label at the start, copy button at the end, so the button never covers code. */}
      {flush ? null : (
        <figcaption className="flex min-h-11 items-center gap-3 border-b border-code-border bg-code-bar py-1 ps-4 pe-1.5 text-caption">
          <span className="min-w-0 flex-1 truncate font-mono text-code-foreground/80">{label}</span>
          <CopyButton text={text} />
        </figcaption>
      )}
      <div
        role="region"
        tabIndex={0}
        aria-label={`${label} code`}
        className={cn(
          "[scrollbar-color:var(--code-border)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          maxHeight ? "max-h-72 overflow-auto" : "overflow-x-auto",
        )}
      >
        <pre className="m-0 w-max min-w-full bg-transparent p-4 font-mono text-mono">
          <code>
            {lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 ? "\n" : null}
                {line.map((t, k) =>
                  t.type === "plain" ? (
                    t.text
                  ) : (
                    <span key={k} className={`tok-${t.type}`}>
                      {t.text}
                    </span>
                  ),
                )}
              </Fragment>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}
