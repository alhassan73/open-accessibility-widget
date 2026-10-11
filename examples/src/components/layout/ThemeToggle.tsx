"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { type MouseEvent, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Must match NoFlashScript. */
const STORAGE_KEY = "oaw-site-theme";
type Theme = "dark" | "light";

// <html data-theme> is the source of truth: the no-flash script sets it before React runs.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";
const getServerTheme = (): Theme | null => null;

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("ThemeToggle");
  const theme = useSyncExternalStore<Theme | null>(subscribe, getTheme, getServerTheme);
  const label = t(theme === null ? "toggle" : theme === "dark" ? "toLight" : "toDark");

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = getTheme() === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage can be blocked; the theme still applies for this visit.
      }
    };

    // The new theme grows as a circle from the button (View Transitions). Instant when unsupported or
    // when the user prefers reduced motion.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof document.startViewTransition !== "function") return apply();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 400,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        ),
      )
      .catch(() => {
        // Skipped transitions (e.g. the tab is hidden) still apply the theme.
      });
  };

  // Icons are switched by CSS from <html data-theme>, so they are right before hydration too.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={label}
          onClick={toggle}
        >
          <Sun
            aria-hidden="true"
            className="absolute size-[1.15rem] scale-0 -rotate-90 opacity-0 transition-[transform,opacity] duration-150 dark:scale-100 dark:rotate-0 dark:opacity-100"
          />
          <Moon
            aria-hidden="true"
            className="absolute size-[1.15rem] scale-100 rotate-0 opacity-100 transition-[transform,opacity] duration-150 dark:scale-0 dark:rotate-90 dark:opacity-0"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
