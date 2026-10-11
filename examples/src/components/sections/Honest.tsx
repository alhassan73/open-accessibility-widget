import { ArrowRight, Check, ShieldAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";
import { Section, SectionHeading } from "./SectionShell";

// Indexes into `Honest.is` and `Honest.isNot` in the messages.
const IS = [0, 1, 2, 3] as const;
const IS_NOT = [0, 1, 2, 3] as const;

/**
 * What the widget is and what it is not, side by side. The project never claims compliance (BR-001): this
 * section says so where the most visitors read it, and links to the limitations guide.
 */
export function Honest() {
  const t = useTranslations("Honest");
  return (
    <Section id="honest" labelledBy="honest-title">
      <SectionHeading
        id="honest"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<ShieldAlert aria-hidden="true" />}
      />
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <Reveal className="rounded-3xl border bg-card p-6 sm:p-8">
          <h3 className="text-h3">{t("isTitle")}</h3>
          <ul className="mt-5 space-y-3">
            {IS.map((i) => (
              <li key={i} className="flex gap-3">
                <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-teal" />
                <span>{t(`is.${i}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={40} className="rounded-3xl border bg-card p-6 sm:p-8">
          <h3 className="text-h3">{t("isNotTitle")}</h3>
          <ul className="mt-5 space-y-3">
            {IS_NOT.map((i) => (
              <li key={i} className="flex gap-3">
                <X aria-hidden="true" className="mt-1 size-5 shrink-0 text-destructive" />
                <span>{t(`isNot.${i}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <p className="mt-8 text-center">
        <Link
          href="/guides/limitations/"
          className="inline-flex items-center gap-1.5 font-bold text-link underline underline-offset-4 hover:text-foreground"
        >
          {t("more")}
          <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
      </p>
    </Section>
  );
}
