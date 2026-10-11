"use client";

import { Check, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAccessibility } from "open-accessibility-widget/react";
import { useEffect, useId, useState } from "react";
import { CodeBlock } from "@/components/code/CodeBlock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DIR } from "@/i18n/config";
import { onColor } from "@/lib/color";
import { SITE_PRIMARY, siteWidgetOptions } from "@/lib/widget";
import type { Dir } from "@/types";
import { OpenWidgetButton } from "./OpenWidgetButton";
import { rich } from "./Rich";
import { Section, SectionHeading } from "./SectionShell";

// Brand swatches; white text has at least 4.5:1 on each. The first is the site's own color.
const SWATCHES = [
  { key: "teal", hex: SITE_PRIMARY },
  { key: "blue", hex: "#1d4ed8" },
  { key: "emerald", hex: "#047857" },
  { key: "amber", hex: "#b45309" },
  { key: "rose", hex: "#be123c" },
  { key: "slate", hex: "#334155" },
] as const;

const SIZE = { min: 40, max: 80, step: 4 } as const;
type Position = "left" | "right";
/** "" follows the page's <html lang> (the widget's default). */
type Language = "" | "en" | "ar";

interface Choice {
  position: Position;
  primary: string;
  buttonSize: number;
  language: Language;
}

/** The site's own options (SiteWidget) as a choice: where the playground starts and what Reset returns to. */
const initialChoice = (dir: Dir): Choice => {
  const site = siteWidgetOptions(dir);
  return { position: site.position, primary: SITE_PRIMARY, buttonSize: site.buttonSize, language: "" };
};

/** The options object for a choice, as the widget takes it. */
const toOptions = (c: Choice, dir: Dir) => ({
  ...siteWidgetOptions(dir),
  position: c.position,
  theme: { primary: c.primary, onPrimary: onColor(c.primary) },
  buttonSize: c.buttonSize,
  language: c.language || undefined,
});

const jsSnippet = (c: Choice) => `import { init } from "open-accessibility-widget";

init({
  position: "${c.position}",
  theme: { primary: "${c.primary}", onPrimary: "${onColor(c.primary)}" },
  buttonSize: ${c.buttonSize},${c.language ? `\n  language: "${c.language}",` : ""}
});`;

const reactSnippet = (c: Choice) => `import { AccessibilityWidget } from "open-accessibility-widget/react";

<AccessibilityWidget
  position="${c.position}"
  theme={{ primary: "${c.primary}", onPrimary: "${onColor(c.primary)}" }}
  buttonSize={${c.buttonSize}}${c.language ? `\n  language="${c.language}"` : ""}
/>`;

const segment =
  "relative inline-flex min-h-11 cursor-pointer items-center rounded-lg px-4 text-small font-bold text-muted-foreground transition-colors duration-150 hover:text-foreground has-checked:bg-card has-checked:text-foreground has-checked:shadow-sm has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring";

/** A row of radio buttons drawn as a segmented control. */
function Segmented<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T;
  options: { value: T; label: string; lang?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-small font-bold text-foreground">{legend}</legend>
      <div className="inline-flex w-fit flex-wrap gap-1 rounded-xl border bg-muted p-1">
        {options.map((o) => (
          <label key={o.value} className={segment} lang={o.lang}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * The live playground: every control changes the widget in the page corner through `widget.setOptions()`, and
 * the code below shows the same options. Leaving the page puts the site's own options back.
 */
export function Playground() {
  const t = useTranslations("Playground");
  const names = useTranslations("LanguageSwitch");
  const id = useId();
  const dir = DIR[useLocale()];
  const { widget } = useAccessibility();
  const [choice, setChoice] = useState<Choice>(() => initialChoice(dir));
  const set = (patch: Partial<Choice>) => setChoice((c) => ({ ...c, ...patch }));

  useEffect(() => {
    widget?.setOptions(toOptions(choice, dir));
  }, [widget, choice, dir]);

  // Restore the site's widget when the playground goes away (client navigation to another page).
  useEffect(() => {
    if (!widget) return;
    return () => widget.setOptions(toOptions(initialChoice(dir), dir));
  }, [widget, dir]);

  return (
    <Section id="playground" labelledBy={`${id}-title`}>
      <SectionHeading
        id={id}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t.rich("description", rich)}
      />

      <div className="grid gap-6 rounded-3xl border bg-card p-4 shadow-elevated sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 lg:p-8">
        <div className="grid content-start gap-7">
          <Segmented
            name={`${id}-position`}
            legend={t("position")}
            value={choice.position}
            options={[
              { value: "left", label: t("left") },
              { value: "right", label: t("right") },
            ]}
            onChange={(position) => set({ position })}
          />

          <div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p id={`${id}-brand`} className="text-small font-bold text-foreground">
                {t("brand")}
              </p>
              <p className="text-caption text-muted-foreground">{t("brandHint")}</p>
            </div>
            <div
              role="radiogroup"
              aria-labelledby={`${id}-brand`}
              className="mt-1 flex flex-wrap items-center"
            >
              {SWATCHES.map(({ key, hex }) => (
                <label key={key} className="relative grid size-11 cursor-pointer place-items-center">
                  <input
                    type="radio"
                    name={`${id}-brand`}
                    value={hex}
                    checked={choice.primary === hex}
                    onChange={() => set({ primary: hex })}
                    aria-label={t(`colors.${key}`)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: hex, color: onColor(hex) }}
                    className="grid size-8 place-items-center rounded-full border border-foreground/25 transition-[transform,box-shadow] duration-150 ease-(--ease-standard) peer-checked:ring-2 peer-checked:ring-foreground peer-checked:ring-offset-2 peer-checked:ring-offset-card peer-hover:scale-110 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring motion-reduce:peer-hover:scale-100 [&>svg]:size-4 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                  >
                    <Check />
                  </span>
                </label>
              ))}
              <label className="relative ms-1 grid size-11 cursor-pointer place-items-center">
                <span className="sr-only">{t("custom")}</span>
                <input
                  type="color"
                  value={choice.primary}
                  onChange={(e) => set({ primary: e.target.value })}
                  className="size-8 cursor-pointer rounded-full border border-foreground/25 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                />
              </label>
              <output
                dir="ltr"
                className="ms-2 font-mono text-small text-muted-foreground uppercase tabular-nums"
              >
                {choice.primary}
              </output>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`${id}-size`} className="text-small font-bold text-foreground">
                {t("size")}
              </label>
              <output
                htmlFor={`${id}-size`}
                dir="ltr"
                className="font-mono text-small text-muted-foreground tabular-nums"
              >
                {choice.buttonSize}px
              </output>
            </div>
            <input
              id={`${id}-size`}
              type="range"
              min={SIZE.min}
              max={SIZE.max}
              step={SIZE.step}
              value={choice.buttonSize}
              onChange={(e) => set({ buttonSize: Number(e.target.value) })}
              aria-valuetext={`${choice.buttonSize}px`}
              className="h-11 w-full accent-primary"
            />
          </div>

          <Segmented
            name={`${id}-lang`}
            legend={t("language")}
            value={choice.language}
            options={[
              { value: "", label: t("pageLanguage") },
              { value: "en", label: names("names.en"), lang: "en" },
              { value: "ar", label: names("names.ar"), lang: "ar" },
            ]}
            onChange={(language) => set({ language })}
          />

          <div className="flex flex-wrap items-center gap-3">
            <OpenWidgetButton label={t("open")} />
            <Button type="button" variant="outline" onClick={() => setChoice(initialChoice(dir))}>
              <RotateCcw aria-hidden="true" className="rtl:-scale-x-100" />
              {t("reset")}
            </Button>
          </div>
          <p className="text-small text-muted-foreground">{t.rich("hint", rich)}</p>
        </div>

        <Tabs defaultValue="js" dir="ltr" className="min-w-0 gap-3">
          <TabsList aria-label={t("codeLabel")}>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
          </TabsList>
          <TabsContent value="js">
            <CodeBlock code={jsSnippet(choice)} lang="ts" />
          </TabsContent>
          <TabsContent value="react">
            <CodeBlock code={reactSnippet(choice)} lang="tsx" />
          </TabsContent>
        </Tabs>
      </div>
    </Section>
  );
}
