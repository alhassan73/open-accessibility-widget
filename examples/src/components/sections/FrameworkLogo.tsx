import {
  siAngular,
  siAstro,
  siJavascript,
  siNextdotjs,
  siNuxt,
  siReact,
  siSvelte,
  siVuedotjs,
  siWordpress,
} from "simple-icons";
import { cn } from "@/lib/utils";
import type { FrameworkSlug } from "@/types";

interface Brand {
  title: string;
  path: string;
  /** Colours for the light and dark theme, as class literals so Tailwind can see them. */
  color: string;
}

const brand = (title: string, icon: { path: string }, color: string): Brand => ({
  title,
  path: icon.path,
  color,
});

// Brand colours, adjusted per theme so every logo stays visible. Near-black logos (Next.js, Astro) and
// WordPress follow the text colour.
const BRANDS: Record<FrameworkSlug, Brand> = {
  vanilla: brand("JavaScript", siJavascript, "text-[#a88900] dark:text-[#f7df1e]"),
  react: brand("React", siReact, "text-[#087ea4] dark:text-[#61dafb]"),
  next: brand("Next.js", siNextdotjs, "text-foreground"),
  vue: brand("Vue.js", siVuedotjs, "text-[#2f9e6d] dark:text-[#4fc08d]"),
  nuxt: brand("Nuxt", siNuxt, "text-[#00a862] dark:text-[#00dc82]"),
  angular: brand("Angular", siAngular, "text-[#dd0031] dark:text-[#ff5470]"),
  svelte: brand("Svelte", siSvelte, "text-[#ff3e00]"),
  astro: brand("Astro", siAstro, "text-foreground"),
  cms: brand("WordPress", siWordpress, "text-foreground"),
};

interface FrameworkLogoProps {
  slug: FrameworkSlug;
  className?: string;
  /** Hide it from assistive tech when the framework name is written next to the logo. */
  decorative?: boolean;
}

/** The brand logo of a framework, inline (no network request) and filled with the theme-aware brand colour. */
export function FrameworkLogo({ slug, className, decorative = false }: FrameworkLogoProps) {
  const logo = BRANDS[slug];
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": logo.title } as const);
  return (
    <svg
      viewBox="0 0 24 24"
      focusable="false"
      {...a11y}
      className={cn("size-6 shrink-0 fill-current", logo.color, className)}
    >
      <path d={logo.path} />
    </svg>
  );
}
