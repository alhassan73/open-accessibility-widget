import { Info, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  info: { icon: Info, box: "border-primary/30 bg-primary/5", mark: "text-link" },
  security: {
    icon: ShieldAlert,
    box: "border-brand-teal/40 bg-brand-teal/5",
    mark: "text-brand-teal",
  },
} as const;

/** A short note set apart from the text: `info` for tips, `security` for things that must not be skipped. */
export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  const { icon: Icon, box, mark } = TONES[tone];
  return (
    <div role="note" className={cn("flex gap-3 rounded-2xl border p-5 text-small", box, className)}>
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", mark)} />
      <div className="min-w-0">
        <p className="font-bold text-foreground">{title}</p>
        {children ? <div className="mt-1 text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}
