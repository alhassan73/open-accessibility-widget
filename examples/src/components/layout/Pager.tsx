import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { DocsNavItem } from "@/types";

const card =
  "flex min-h-20 flex-col gap-1 rounded-xl border bg-card p-4 transition-colors duration-150 hover:border-primary/40 hover:bg-accent sm:p-5";
const hint = "inline-flex items-center gap-1.5 text-caption font-bold text-muted-foreground";

/** Previous and next page cards, in the order of the sidebar. */
export function Pager({
  label,
  prevLabel,
  nextLabel,
  prev,
  next,
}: {
  label: string;
  prevLabel: string;
  nextLabel: string;
  prev?: DocsNavItem;
  next?: DocsNavItem;
}) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={label} className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} rel="prev" className={card}>
          <span className={hint}>
            <ArrowLeft aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
            {prevLabel}
          </span>
          <span className="text-body font-bold text-foreground">{prev.title ?? prev.label}</span>
        </Link>
      ) : null}
      {next ? (
        <Link
          href={next.href}
          rel="next"
          className={cn(card, "items-end text-end", !prev && "sm:col-start-2")}
        >
          <span className={hint}>
            {nextLabel}
            <ArrowRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
          </span>
          <span className="text-body font-bold text-foreground">{next.title ?? next.label}</span>
        </Link>
      ) : null}
    </nav>
  );
}
