import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/** Page width + side gutters shared by every section. */
export const CONTAINER = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

interface SectionProps {
  /** Anchor id of the section. */
  id?: string;
  /** id of the heading that names the section. */
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, labelledBy, className, children }: SectionProps) {
  return (
    // The sticky-header offset comes from `scroll-padding-top` on <html> (globals.css).
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative py-16 md:py-24", className)}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  /** Same as the section id; the h2 gets id `${id}-title`. */
  id: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  icon,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn("mx-auto mb-10 max-w-160 text-center md:mb-14", className)}>
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-caption font-bold text-muted-foreground [&>svg]:size-3.5 [&>svg]:text-link">
        {icon}
        {eyebrow}
      </p>
      <h2 id={`${id}-title`} className="text-h2">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-160 text-lead text-muted-foreground">{description}</p>
      ) : null}
    </Reveal>
  );
}
