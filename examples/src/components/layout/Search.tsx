"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "@/i18n/navigation";
import { excerpt, type Hit, prepare, search, segments } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { SearchEntry, SearchGroup } from "@/types";

/** Order of the headings in the list. */
const GROUPS: SearchGroup[] = ["start", "frameworks", "guides", "reference", "changelog"];

const noop = () => () => {};
const isApple = () => /mac|iphone|ipad|ipod/i.test(navigator.platform);

const kbd =
  "inline-flex min-w-5 items-center justify-center rounded-sm border border-input bg-background px-1.5 text-caption font-bold leading-5 text-muted-foreground";

/** Text with the matched ranges in <mark>. Built from text nodes, never from HTML. */
function Marked({ text, found }: { text: string; found: [number, number][] }) {
  return segments(text, found).map(([piece, hit], i) =>
    hit ? (
      <mark key={i} className="rounded-xs bg-primary/20 font-bold text-foreground">
        {piece}
      </mark>
    ) : (
      piece
    ),
  );
}

/** Whether typing happens here: an editable element always, other form fields when `anyField`. */
function typingTarget(target: EventTarget | null, anyField: boolean) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return anyField && target.closest("input, textarea, select") !== null;
}

/**
 * Docs search: a button in the header and a dialog with an ARIA combobox over a listbox. The index of the
 * current language comes from the server; matching runs in the browser.
 */
export function Search({ index }: { index: SearchEntry[] }) {
  const t = useTranslations("Search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const navigated = useRef(false);
  const id = useId();
  const listId = `${id}-list`;

  // The platform is only known in the browser: the server renders a hidden neutral hint.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const apple = useSyncExternalStore(noop, isApple, () => false);

  const prepared = useMemo(() => prepare(index), [index]);
  const hits = useMemo(() => search(prepared, query), [prepared, query]);
  // List order follows the headings; inside a heading the best match comes first.
  const groups = useMemo(
    () =>
      GROUPS.map((group) => ({ group, hits: hits.filter((h) => h.entry.group === group) })).filter(
        (g) => g.hits.length > 0,
      ),
    [hits],
  );
  const ordered = useMemo(() => groups.flatMap((g) => g.hits), [groups]);
  const optionId = (i: number) => `${id}-opt-${i}`;

  const show = useCallback((from?: HTMLElement | null) => {
    returnTo.current = from ?? (document.activeElement as HTMLElement | null);
    navigated.current = false;
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.altKey) return;
      const combo =
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        (e.key.toLowerCase() === "k" || e.code === "KeyK");
      const slash = !e.metaKey && !e.ctrlKey && e.key === "/";
      if (!combo && !slash) return;
      // Ctrl+K is "insert link" in rich text editors, and "/" is a character.
      if (typingTarget(e.target, slash)) return;
      e.preventDefault();
      if (combo && open) setOpen(false);
      else if (!open) show();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show]);

  // Keep the active option in view; the first one scrolls to the top so its heading shows too.
  useEffect(() => {
    if (!open) return;
    if (active === 0) listRef.current?.scrollTo({ top: 0 });
    else document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
  }, [active, open, query]);

  function choose(hit: Hit | undefined) {
    if (!hit) return;
    navigated.current = true;
    setOpen(false);
    // The href may end in "#anchor": the router prefixes the language and scrolls to the anchor.
    router.push(hit.entry.href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;
    const last = ordered.length - 1;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (last < 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + ordered.length) % ordered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(ordered[active]);
    }
  }

  const trigger = "inline-flex items-center rounded-md transition-colors duration-150";
  const hint = apple ? "⌘K" : "Ctrl K";
  const hasQuery = query.trim() !== "";
  let n = -1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => (next ? show() : setOpen(false))}>
      {/* Icon only below md and at lg, where the centred nav leaves no room; the wide field elsewhere. */}
      <button
        type="button"
        aria-label={t("open")}
        aria-keyshortcuts="Control+K Meta+K"
        onClick={(e) => show(e.currentTarget)}
        className={cn(
          trigger,
          "size-11 justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden lg:inline-flex xl:hidden",
        )}
      >
        <SearchIcon aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={(e) => show(e.currentTarget)}
        className={cn(
          trigger,
          "hidden h-9 w-56 gap-2 border border-input bg-muted ps-3 pe-2 text-start text-small text-muted-foreground hover:bg-accent hover:text-accent-foreground md:inline-flex lg:hidden xl:inline-flex",
          "rounded-[10px]",
        )}
      >
        <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{t("trigger")}</span>
        <kbd
          aria-hidden="true"
          className={cn(
            kbd,
            "ms-auto shrink-0 transition-opacity duration-150",
            !mounted && "opacity-0",
          )}
        >
          {hint}
        </kbd>
      </button>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).querySelector("input")?.focus();
          }}
          onCloseAutoFocus={(e) => {
            // After a jump the target (or the new page) owns focus and scroll; otherwise go back to where we were.
            e.preventDefault();
            if (!navigated.current && returnTo.current?.isConnected) returnTo.current.focus();
          }}
          className="fixed inset-x-4 top-[15vh] z-50 mx-auto flex max-h-[min(34rem,75vh)] max-w-160 flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-(--shadow-elevated) outline-none duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none"
        >
          <DialogPrimitive.Title className="sr-only">{t("title")}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("description")}
          </DialogPrimitive.Description>

          <div className="relative flex shrink-0 items-center border-b focus-within:shadow-[inset_0_-2px_0_var(--ring)]">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute inset-s-4 size-5 text-muted-foreground"
            />
            <input
              type="text"
              role="combobox"
              aria-label={t("label")}
              aria-expanded={ordered.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={ordered.length > 0 ? optionId(active) : undefined}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder={t("placeholder")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              dir="auto"
              className="h-14 min-w-0 flex-1 bg-transparent pe-2 ps-12 text-body text-foreground outline-none placeholder:text-muted-foreground"
            />
            <DialogPrimitive.Close
              aria-label={t("close")}
              className="me-1.5 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
            >
              <X aria-hidden="true" className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div role="status" aria-live="polite" className="sr-only">
            {hasQuery ? t("count", { count: ordered.length }) : ""}
          </div>

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            <div id={listId} role="listbox" aria-label={t("results")}>
              {groups.map(({ group, hits: items }) => (
                <div key={group} role="group" aria-labelledby={`${id}-g-${group}`} className="pb-1">
                  <div
                    id={`${id}-g-${group}`}
                    role="presentation"
                    className="px-3 pt-2 pb-1 text-caption font-bold text-muted-foreground"
                  >
                    {t(`groups.${group}`)}
                  </div>
                  {items.map((hit) => {
                    const i = ++n;
                    const { entry } = hit;
                    const snippet = excerpt(entry.text, hit.textRanges);
                    return (
                      <div
                        key={entry.href + entry.title + i}
                        id={optionId(i)}
                        role="option"
                        aria-selected={i === active}
                        onClick={() => choose(hit)}
                        onPointerMove={() => i !== active && setActive(i)}
                        className="flex cursor-pointer flex-col gap-0.5 rounded-lg border-s-2 border-transparent px-3 py-2 aria-selected:border-link aria-selected:bg-accent"
                      >
                        <span className="flex min-w-0 items-baseline gap-2 text-small font-bold text-foreground">
                          <span dir="auto" className="truncate">
                            <Marked text={entry.title} found={hit.titleRanges} />
                          </span>
                          {entry.parent && (
                            <span className="shrink-0 text-caption text-muted-foreground">
                              {entry.parent}
                            </span>
                          )}
                        </span>
                        {entry.text && (
                          <span
                            dir="auto"
                            className="line-clamp-1 text-caption text-muted-foreground"
                          >
                            <Marked
                              text={snippet.text}
                              found={hit.textRanges.map(([s, e]) => [
                                s - snippet.shift,
                                e - snippet.shift,
                              ])}
                            />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {hasQuery && ordered.length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="text-small font-bold text-foreground">
                  {t("empty", { query: query.trim() })}
                </p>
                <p className="mt-1 text-caption text-muted-foreground">{t("emptyHint")}</p>
              </div>
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-4 border-t px-4 py-2 text-caption text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <kbd className={kbd}>↑</kbd>
              <kbd className={kbd}>↓</kbd>
              {t("hints.navigate")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className={kbd}>↵</kbd>
              {t("hints.open")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className={kbd}>esc</kbd>
              {t("hints.close")}
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
