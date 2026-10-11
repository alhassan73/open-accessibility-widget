import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { docsH2 } from "./docs-styles";

interface DocSectionProps {
  /** Stable, language-neutral id of the h2: the "On this page" list and #links use it. */
  id: string;
  title: ReactNode;
  /** Shown in a badge before the title (the steps of Getting started). */
  step?: number;
  className?: string;
  children?: ReactNode;
}

/** One h2 section of a docs page: a rule and 48px above it, the heading, then its content 16px apart. */
export function DocSection({ id, title, step, className, children }: DocSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("mt-12 border-t pt-10 first:mt-0 first:border-t-0 first:pt-0", className)}
    >
      <div className="flex items-center gap-3">
        {step ? (
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-(image:--wm-grad) text-base font-extrabold text-white tabular-nums"
          >
            {step}
          </span>
        ) : null}
        <h2 id={id} className={docsH2}>
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
