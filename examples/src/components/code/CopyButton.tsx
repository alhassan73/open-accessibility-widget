"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/** Copies `text` to the clipboard, shows "Copied" for two seconds and announces it to screen readers. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("CodeBlock");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // clipboard blocked (permissions, insecure context): stay silent, nothing was copied
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "inline-flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2 text-caption font-bold text-code-foreground/80 transition-colors duration-(--dur-hover) ease-(--ease-standard) hover:bg-code-foreground/10 hover:text-code-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
          copied && "text-code-foreground",
          className,
        )}
      >
        {copied ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {copied ? (
          <span lang={locale}>{t("copied")}</span>
        ) : (
          <span lang={locale} className="sr-only">
            {t("copy")}
          </span>
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? <span lang={locale}>{t("copied")}</span> : null}
      </span>
    </>
  );
}
