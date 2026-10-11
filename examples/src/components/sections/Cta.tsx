import { ArrowRight, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { npmUrl, PKG, REPO } from "@/lib/site";
import { GithubMark } from "./GithubMark";
import { Reveal } from "./Reveal";
import { CONTAINER } from "./SectionShell";

export function Cta() {
  const t = useTranslations("Cta");
  return (
    <section aria-labelledby="cta-title" className="relative pb-16 md:pb-24">
      <div className={CONTAINER}>
        <Reveal className="relative isolate overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center shadow-elevated sm:px-12 md:py-24">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-glow" />
          <h2 id="cta-title" className="mx-auto max-w-160 text-h2">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-160 text-lead text-muted-foreground">{t("text")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/getting-started/" className={buttonVariants({ size: "lg" })}>
              {t("start")}
              <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <GithubMark />
              {t("github")}
              <span className="sr-only">{t("newTab")}</span>
            </a>
            <a
              href={npmUrl(PKG)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              {t("npm")}
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">{t("newTab")}</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
