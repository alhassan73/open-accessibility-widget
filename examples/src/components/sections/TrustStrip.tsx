import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import { CONTAINER } from "./SectionShell";

// Indexes into `TrustStrip.stats` in the messages.
const STATS = [0, 1, 2, 3] as const;

/** Four facts in one row: equal cells divided by hairlines (the 1px gap shows the container's background). */
export function TrustStrip() {
  const t = useTranslations("TrustStrip");
  return (
    <div className={CONTAINER}>
      <ul
        role="list"
        aria-label={t("label")}
        className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((stat, i) => (
          <Reveal
            as="li"
            key={stat}
            delay={i * 40}
            className="flex flex-col items-center gap-2 bg-card p-6 text-center"
          >
            <p className="text-gradient text-2xl font-extrabold tabular-nums md:text-3xl">
              {t(`stats.${stat}.value`)}
            </p>
            <p className="text-small text-muted-foreground">{t(`stats.${stat}.label`)}</p>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
