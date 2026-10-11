import {
  BookOpen,
  Eye,
  Focus,
  Keyboard,
  Minus,
  Plus,
  Type,
  VolumeX,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { WidgetIcon } from "@/components/layout/WidgetIcon";
import { cn } from "@/lib/utils";

// Profile tiles in the mock; the second one is "on".
const TILES: LucideIcon[] = [Zap, Eye, Focus, BookOpen, Keyboard, VolumeX];
const bar = "h-2.5 rounded-full bg-muted-foreground/35";

/**
 * A static picture of the widget for the hero: the panel (brand header, profile tiles, a stepper and a
 * switch) above its launcher, drawn with plain elements (no text, nothing focusable). The real widget is in
 * the page corner, and the playground below changes it live.
 */
export function HeroPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm lg:max-w-md">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-elevated">
        <div className="flex items-center gap-3 bg-primary px-5 py-4 text-primary-foreground">
          <span className="grid size-9 place-items-center rounded-xl bg-white/15">
            <WidgetIcon className="size-5" />
          </span>
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/5 rounded-full bg-white/90" />
            <div className="h-2 w-3/5 rounded-full bg-white/55" />
          </div>
          <span className="grid size-8 place-items-center rounded-lg bg-white/10">
            <X className="size-4" />
          </span>
        </div>

        <div className="space-y-4 bg-muted/40 p-4">
          <div className="grid grid-cols-3 gap-2.5">
            {TILES.map((Icon, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border bg-card p-3",
                  i === 1 && "border-primary bg-primary/10",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-xl bg-primary/10 text-link",
                    i === 1 && "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className={cn(bar, "h-2 w-4/5")} />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <Type className="size-4 text-muted-foreground" />
              <div className={cn(bar, "w-1/3")} />
              <div className="ms-auto flex items-center gap-1 rounded-full border p-1">
                <span className="grid size-6 place-items-center rounded-full bg-muted">
                  <Minus className="size-3" />
                </span>
                <span className="w-9 text-center font-mono text-caption font-bold text-foreground">
                  120%
                </span>
                <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Plus className="size-3" />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="size-4 text-muted-foreground" />
              <div className={cn(bar, "w-2/5")} />
              <span className="ms-auto flex h-6 w-11 items-center justify-end rounded-full bg-primary p-0.5">
                <span className="size-5 rounded-full bg-white" />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="size-4 text-muted-foreground" />
              <div className={cn(bar, "w-1/4")} />
              <span className="ms-auto flex h-6 w-11 items-center rounded-full bg-muted-foreground/30 p-0.5">
                <span className="size-5 rounded-full bg-white" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <span className="relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_color-mix(in_oklab,var(--primary)_45%,transparent)]">
          <WidgetIcon className="size-7" />
          <span className="absolute inset-e-0.5 top-0.5 size-3 rounded-full border-2 border-card bg-brand-cyan" />
        </span>
      </div>
    </div>
  );
}
