import {
  Accessibility,
  Feather,
  Languages,
  Layers,
  Lock,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { rich } from "./Rich";
import { Section, SectionHeading } from "./SectionShell";

// Icons in the same order as `Features.items` in the messages. The first two are the large cards.
const ICONS: LucideIcon[] = [
  Accessibility,
  Palette,
  SlidersHorizontal,
  Languages,
  Layers,
  Feather,
  ShieldCheck,
  Lock,
];
const LARGE = 2;
// Language-neutral tags shown at the bottom of the large cards.
const TAGS: { mono: boolean; items: string[] }[] = [
  { mono: false, items: ["WAI-ARIA", "axe-core", "forced-colors", "prefers-reduced-motion"] },
  { mono: true, items: ["theme.primary", "--a11yw-primary", "icon", "logo"] },
];

/** Bento grid: two large cards on top, six small ones below; cards in a row share one height. */
export function Features() {
  const t = useTranslations("Features");
  return (
    <Section id="features" labelledBy="features-title">
      <SectionHeading
        id="features"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<Sparkles aria-hidden="true" />}
      />

      <ul role="list" className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-6">
        {ICONS.map((Icon, i) => {
          const large = i < LARGE;
          const tags = large ? TAGS[i] : undefined;
          return (
            <Reveal
              as="li"
              key={i}
              delay={(i % 3) * 40}
              className={cn("flex", large ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-2")}
            >
              <Card
                className={cn(
                  "group h-full w-full gap-4 rounded-3xl transition-colors duration-150 ease-(--ease-standard) hover:border-primary/40",
                  large && "gap-5 bg-linear-to-br from-primary/10 via-card to-card py-8",
                )}
              >
                <CardHeader className={large ? "px-8" : undefined}>
                  <span
                    className={cn(
                      "mb-2 grid place-items-center rounded-2xl bg-primary/10 text-link ring-1 ring-primary/20 transition-colors duration-150 group-hover:bg-primary/15",
                      large ? "size-14" : "size-12",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={large ? "size-7" : "size-6"}
                      strokeWidth={1.75}
                    />
                  </span>
                  <CardTitle asChild>
                    <h3 className="text-h3">{t(`items.${i}.title`)}</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn("flex flex-1 flex-col gap-5", large && "px-8")}>
                  <p className={cn("text-muted-foreground", large ? "text-body" : "text-small")}>
                    {t.rich(`items.${i}.text`, rich)}
                  </p>
                  {tags ? (
                    <ul role="list" dir="ltr" className="mt-auto flex flex-wrap gap-2">
                      {tags.items.map((tag) => (
                        <li
                          key={tag}
                          className={cn(
                            "rounded-full border bg-background px-3 py-1 text-caption font-bold text-muted-foreground",
                            tags.mono && "font-mono",
                          )}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
