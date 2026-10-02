import { DEFAULT_SETTINGS } from "../settings";
import type { AccessibilitySettings } from "../types";
import { injectStyles } from "./css";

export interface Engine {
  apply(settings: AccessibilitySettings): void;
  destroy(): void;
}

const IGNORE = ".a11yw-ignore";

/** Applies settings to the page. Idempotent: call `apply` with every new settings object. */
export function createEngine(doc: Document, nonce?: string): Engine {
  injectStyles(doc, nonce);
  const html = doc.documentElement;
  const font = createFontScaler(doc);
  const pointer = createPointerTools(doc);
  const media = createMediaControl(doc);

  /** Toggle `a11yw-<name>` on <html>; a string value is also exposed as `--a11yw-<name>`. */
  const flag = (name: string, value: string | boolean) => {
    html.classList.toggle(`a11yw-${name}`, value !== false);
    if (typeof value === "string") html.style.setProperty(`--a11yw-${name}`, value);
    else html.style.removeProperty(`--a11yw-${name}`);
  };

  const apply = (s: AccessibilitySettings) => {
    flag("scale", s.contentScale !== 100 && String(s.contentScale / 100));
    flag("lh", s.lineHeight !== 100 && String(1.5 * (s.lineHeight / 100)));
    flag("ls", s.letterSpacing !== 100 && `${((s.letterSpacing - 100) / 100) * 0.2}em`);
    html.style.setProperty("--a11yw-ws", `${((s.letterSpacing - 100) / 100) * 0.3}em`);
    flag("align", s.textAlign !== "default" && s.textAlign);
    flag("readable", s.readableFont);
    flag("titles", s.highlightTitles);
    flag("links", s.highlightLinks);
    flag("focus", s.highlightFocus);
    flag("hover", s.highlightHover);
    flag("hide-img", s.hideImages);
    flag("no-motion", s.stopAnimations);
    flag("cursor-black", s.cursor === "black");
    flag("cursor-white", s.cursor === "white");
    flag("dark", s.colorMode === "dark-contrast");
    flag("light", s.colorMode === "light-contrast");
    flag("text-color", s.textColor ?? false);
    flag("title-color", s.titleColor ?? false);
    flag("bg-color", s.backgroundColor ?? false);

    const filters = [
      s.colorMode === "high-contrast" && "contrast(1.4)",
      s.saturationMode === "monochrome" && "grayscale(1)",
      s.saturationMode === "low-saturation" && "saturate(0.5)",
      s.saturationMode === "high-saturation" && "saturate(2)",
    ].filter(Boolean);
    flag("filter", filters.length > 0 && filters.join(" "));

    font.set(s.fontSize);
    pointer.set({ guide: s.readingGuide, mask: s.readingMask, magnifier: s.textMagnifier });
    media.set(s.muteSounds, s.stopAnimations);
  };

  return {
    apply,
    destroy() {
      apply(DEFAULT_SETTINGS);
      html.style.removeProperty("--a11yw-ws");
    },
  };
}

/**
 * Font size: each text element's original size is measured once (with scaling
 * switched off) into `--a11yw-fs`; the CSS multiplies it by `--a11yw-font`.
 * New content is measured as it appears, so SPAs keep working.
 */
function createFontScaler(doc: Document) {
  const html = doc.documentElement;
  const win = doc.defaultView!;
  const ATTR = "data-a11yw-fs";
  const FIELDS = "input, textarea, select";
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  const queue = new Set<Node>();
  let observer: MutationObserver | null = null;
  let frame = 0;
  let resizeTimer = 0;

  const measure = (roots: Iterable<Node>) => {
    const targets = new Set<HTMLElement>();
    for (const root of roots) {
      if (!root.isConnected) continue;
      if (root.nodeType === Node.TEXT_NODE) {
        if (root.nodeValue?.trim() && root.parentElement) targets.add(root.parentElement);
        continue;
      }
      if (!(root instanceof Element) || root.closest(IGNORE)) continue;
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.nodeValue?.trim() && n.parentElement) targets.add(n.parentElement);
      }
      if (root.matches(FIELDS)) targets.add(root as HTMLElement);
      root.querySelectorAll<HTMLElement>(FIELDS).forEach((el) => targets.add(el));
    }

    const fresh = [...targets].filter(
      (el) => !el.hasAttribute(ATTR) && !SKIP.has(el.tagName) && !el.closest(IGNORE)
    );
    if (!fresh.length) return;

    // Read every size first with scaling off, then write — one layout pass.
    html.classList.remove("a11yw-font");
    const sizes = fresh.map((el) => parseFloat(win.getComputedStyle(el).fontSize));
    fresh.forEach((el, i) => {
      if (!(sizes[i] > 0)) return;
      el.setAttribute(ATTR, "");
      el.style.setProperty("--a11yw-fs", `${sizes[i]}px`);
    });
    html.classList.add("a11yw-font");
  };

  const clear = () => {
    doc.querySelectorAll<HTMLElement>(`[${ATTR}]`).forEach((el) => {
      el.removeAttribute(ATTR);
      el.style.removeProperty("--a11yw-fs");
    });
  };

  const flush = () => {
    frame = 0;
    const roots = [...queue];
    queue.clear();
    measure(roots);
  };

  const onMutations = (records: MutationRecord[]) => {
    for (const record of records) record.addedNodes.forEach((n) => queue.add(n));
    if (queue.size && !frame) frame = win.requestAnimationFrame(flush);
  };

  // Responsive sites change base sizes per breakpoint, so re-measure after resizing.
  const onResize = () => {
    win.clearTimeout(resizeTimer);
    resizeTimer = win.setTimeout(() => {
      clear();
      measure([doc.body]);
    }, 250);
  };

  const disable = () => {
    if (!observer) return;
    observer.disconnect();
    observer = null;
    win.cancelAnimationFrame(frame);
    win.clearTimeout(resizeTimer);
    win.removeEventListener("resize", onResize);
    frame = 0;
    queue.clear();
    clear();
    html.classList.remove("a11yw-font");
    html.style.removeProperty("--a11yw-font");
  };

  return {
    set(percent: number) {
      if (percent === 100) return disable();
      html.style.setProperty("--a11yw-font", String(percent / 100));
      if (observer) return;
      measure([doc.body]);
      observer = new MutationObserver(onMutations);
      observer.observe(doc.body, { childList: true, subtree: true });
      win.addEventListener("resize", onResize);
    },
  };
}

type PointerTool = "guide" | "mask" | "magnifier";
const POINTER_TOOLS: PointerTool[] = ["guide", "mask", "magnifier"];
const TEXT_BLOCKS =
  "p,li,a,button,label,h1,h2,h3,h4,h5,h6,td,th,dt,dd,blockquote,figcaption,summary,legend,caption,span";

/** Reading guide, reading mask and text magnifier — all follow the pointer. */
function createPointerTools(doc: Document) {
  const win = doc.defaultView!;
  const els: Partial<Record<PointerTool, HTMLDivElement>> = {};
  let layer: HTMLDivElement | null = null;
  let x = win.innerWidth / 2;
  let y = win.innerHeight / 2;
  let target: EventTarget | null = null;
  let lastTarget: EventTarget | null = null;
  let frame = 0;
  let listening = false;

  const updateMagnifier = (box: HTMLDivElement) => {
    if (target !== lastTarget) {
      lastTarget = target;
      const block = target instanceof Element ? target.closest<HTMLElement>(TEXT_BLOCKS) : null;
      const text =
        block && !block.closest(IGNORE)
          ? (block.innerText || "").replace(/\s+/g, " ").trim().slice(0, 300)
          : "";
      box.textContent = text;
      box.hidden = !text;
    }
    if (box.hidden) return;
    const { offsetWidth: w, offsetHeight: h } = box;
    const left = Math.max(8, Math.min(x + 16, win.innerWidth - w - 8));
    const top = y + 24 + h > win.innerHeight ? Math.max(8, y - h - 16) : y + 24;
    box.style.transform = `translate(${left}px, ${top}px)`;
  };

  const render = () => {
    frame = 0;
    if (els.guide) {
      const w = els.guide.offsetWidth;
      const left = Math.max(0, Math.min(x - w / 2, win.innerWidth - w));
      els.guide.style.transform = `translate(${left}px, ${y + 14}px)`;
    }
    if (els.mask) els.mask.style.transform = `translateY(${y - 70}px)`;
    if (els.magnifier) updateMagnifier(els.magnifier);
  };

  const schedule = () => {
    if (!frame) frame = win.requestAnimationFrame(render);
  };

  const onMove = (e: PointerEvent) => {
    x = e.clientX;
    y = e.clientY;
    target = e.target;
    schedule();
  };

  const onLeave = () => {
    target = null;
    schedule();
  };

  return {
    set(next: Record<PointerTool, boolean>) {
      for (const tool of POINTER_TOOLS) {
        if (next[tool] && !els[tool]) {
          if (!layer) {
            layer = doc.createElement("div");
            layer.className = "a11yw-ignore a11yw-layer";
            layer.setAttribute("aria-hidden", "true");
            doc.body.appendChild(layer);
          }
          const el = doc.createElement("div");
          el.className = `a11yw-${tool}`;
          el.hidden = tool === "magnifier";
          layer.appendChild(el);
          els[tool] = el;
          lastTarget = null;
        } else if (!next[tool] && els[tool]) {
          els[tool]!.remove();
          delete els[tool];
        }
      }

      const active = POINTER_TOOLS.some((tool) => next[tool]);
      if (active && !listening) {
        doc.addEventListener("pointermove", onMove, { passive: true });
        doc.documentElement.addEventListener("pointerleave", onLeave);
      } else if (!active && listening) {
        doc.removeEventListener("pointermove", onMove);
        doc.documentElement.removeEventListener("pointerleave", onLeave);
        win.cancelAnimationFrame(frame);
        frame = 0;
        layer?.remove();
        layer = null;
      }
      listening = active;
      if (active) schedule();
    },
  };
}

/** Mutes page media (including media that starts later) and pauses playing videos. */
function createMediaControl(doc: Document) {
  const mutedByUs = new Set<HTMLMediaElement>();
  const pausedByUs = new Set<HTMLMediaElement>();
  let muting = false;
  let pausing = false;

  const mute = (m: HTMLMediaElement) => {
    if (m.muted || m.closest(IGNORE)) return;
    m.muted = true;
    mutedByUs.add(m);
  };
  const onPlay = (e: Event) => {
    if (e.target instanceof HTMLMediaElement) mute(e.target);
  };

  return {
    set(muteSounds: boolean, pauseVideos: boolean) {
      if (muteSounds !== muting) {
        muting = muteSounds;
        if (muting) {
          doc.querySelectorAll<HTMLMediaElement>("audio, video").forEach(mute);
          doc.addEventListener("play", onPlay, true); // `play` doesn't bubble; capture catches all
        } else {
          doc.removeEventListener("play", onPlay, true);
          mutedByUs.forEach((m) => (m.muted = false));
          mutedByUs.clear();
        }
      }

      if (pauseVideos !== pausing) {
        pausing = pauseVideos;
        if (pausing) {
          doc.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
            if (v.paused || v.closest(IGNORE)) return;
            v.pause();
            pausedByUs.add(v);
          });
        } else {
          pausedByUs.forEach((v) => v.isConnected && v.play().catch(() => {}));
          pausedByUs.clear();
        }
      }
    },
  };
}
