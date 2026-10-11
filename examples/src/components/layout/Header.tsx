"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { siGithub, siNpm } from "simple-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { SearchEntry } from "@/types";
import { LanguageSwitch } from "./LanguageSwitch";
import { DOCS_CONTAINER } from "./docs-styles";
import { isCurrent, LINKS, PAGES } from "./nav";
import { Search } from "./Search";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

/** Page scrolled more than this many px: the bar gains a border. */
const COMPACT_AFTER = 8;

const desktopLink =
  "relative inline-flex min-h-11 items-center rounded-md px-3 py-2 whitespace-nowrap text-small font-bold text-muted-foreground transition-colors duration-150 hover:text-foreground aria-[current=page]:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-brand-gradient after:transition-transform after:duration-200 after:ease-out-expo aria-[current=page]:after:scale-x-100";
const sheetLink =
  "flex min-h-11 items-center rounded-md px-3 py-3 text-body font-bold text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground";

function BrandIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 fill-current">
      <path d={path} />
    </svg>
  );
}

export function Header({ searchIndex }: { searchIndex: SearchEntry[] }) {
  const t = useTranslations("Header");
  const nav = useTranslations("Nav");
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > COMPACT_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-compact={compact ? "" : undefined}
      className="sticky top-0 z-40 border-b border-transparent bg-header backdrop-blur-2xl backdrop-saturate-150 transition-colors data-compact:border-border"
    >
      <div
        className={cn(
          // As wide as the docs pages, so the wordmark lines up with their sidebar.
          DOCS_CONTAINER,
          "flex h-16 items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-5",
        )}
      >
        <Link
          href="/"
          aria-label={t("home")}
          className="-ms-1 inline-flex w-fit justify-self-start rounded-lg p-1"
        >
          {/* The full name doesn't fit beside the buttons on the narrowest phones: the mark alone there. */}
          <span className="max-[399px]:hidden">
            <Wordmark />
          </span>
          <span className="min-[400px]:hidden">
            <Wordmark variant="mark" />
          </span>
        </Link>

        <nav aria-label={t("nav")} className="hidden lg:block lg:justify-self-center">
          <ul className="flex items-center gap-1">
            {/* The wordmark is the link home, so the bar lists only the sections (the menu sheet keeps Home). */}
            {PAGES.filter(({ key }) => key !== "home").map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={isCurrent(pathname, href) ? "page" : undefined}
                  className={desktopLink}
                >
                  {nav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 lg:justify-self-end">
          <Search index={searchIndex} />
          <LanguageSwitch className="hidden sm:inline-flex" />
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" className="hidden xl:inline-flex">
            <a href={LINKS.github} rel="noreferrer" aria-label={t("github")}>
              <BrandIcon path={siGithub.path} />
            </a>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t("openMenu")}
              >
                <Menu aria-hidden="true" className="size-5" />
              </Button>
            </SheetTrigger>
            {/* "end" is the side the button is on: right in English, left in Arabic. */}
            <SheetContent side="end" closeLabel={t("close")} className="gap-0">
              <SheetHeader className="border-b">
                <SheetTitle>{t("menu")}</SheetTitle>
                <SheetDescription className="sr-only">{t("menuDescription")}</SheetDescription>
              </SheetHeader>
              <nav aria-label={t("nav")} className="flex-1 overflow-y-auto p-3">
                <ul className="grid gap-1">
                  {PAGES.map(({ key, href }) => (
                    <li key={key}>
                      <SheetClose asChild>
                        <Link
                          href={href}
                          aria-current={isCurrent(pathname, href) ? "page" : undefined}
                          className={sheetLink}
                        >
                          {nav(key)}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-wrap items-center gap-2 border-t p-4">
                <LanguageSwitch className="border border-input" />
                <Button asChild variant="outline" size="sm">
                  <a href={LINKS.github} rel="noreferrer">
                    <BrandIcon path={siGithub.path} />
                    GitHub
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={LINKS.npm} rel="noreferrer">
                    <BrandIcon path={siNpm.path} />
                    npm
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
