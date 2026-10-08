import { DEFAULT_SETTINGS } from "../settings";
import type { AccessibilitySettings } from "../types";
import { injectStyles } from "./css";

export interface EngineOptions {
  /** CSP nonce for injected `<style>` tags. */
  nonce?: string;
  /** The widget's z-index; pointer tools are stacked just below it. */
  zIndex?: number;
}

export interface Engine {
  apply(settings: AccessibilitySettings): void;
  /** Re-attach everything after the page replaced `<body>` (Turbo, htmx, view transitions…). */
  refresh(): void;
  setZIndex(zIndex: number): void;
  destroy(): void;
}

const IGNORE = ".a11yw-ignore";
const DEFAULT_Z = 2147483000;

/** Applies settings to the page. Idempotent: call `apply` with every new settings object. */
export function createEngine(doc: Document, options: EngineOptions = {}): Engine {
  injectStyles(doc, options.nonce);
  const html = doc.documentElement;
  const hadStyleAttr = html.hasAttribute("style");
  const font = createFontScaler(doc, options.nonce);
  const pointer = createPointerTools(doc, options.zIndex ?? DEFAULT_Z);
  const media = createMediaControl(doc);
  let last: AccessibilitySettings = DEFAULT_SETTINGS;
  const classes = new Set<string>();
  const vars = new Map<string, string>();

  const setVar = (name: string, value: string | false) => {
    const prop = `--a11yw-${name}`;
    if (value === false) {
      html.style.removeProperty(prop);
      vars.delete(prop);
    } else {
      html.style.setProperty(prop, value);
      vars.set(prop, value);
    }
  };

  /** Toggle `a11yw-<name>` on <html>; a string value is also exposed as `--a11yw-<name>`. */
  const flag = (name: string, value: string | false | boolean) => {
    const cls = `a11yw-${name}`;
    html.classList.toggle(cls, value !== false);
    if (value === false) classes.delete(cls);
    else classes.add(cls);
    setVar(name, typeof value === "string" && value);
  };

  const apply = (s: AccessibilitySettings) => {
    last = s;
    const spacing = s.letterSpacing !== 100 && (s.letterSpacing - 100) / 100;
    flag("scale", s.contentScale !== 100 && String(s.contentScale / 100));
    flag("lh", s.lineHeight !== 100 && String(1.5 * (s.lineHeight / 100)));
    flag("ls", spacing !== false && `${spacing * 0.2}em`);
    setVar("ws", spacing !== false && `${spacing * 0.3}em`);
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

  // Frameworks that render <html class> / <html style> can wipe the flags: put them back.
  const intact = () =>
    [...classes].every((c) => html.classList.contains(c)) &&
    [...vars].every(([prop, value]) => html.style.getPropertyValue(prop).trim() === value) &&
    font.intact();
  const guard = new MutationObserver(() => {
    if (intact()) return;
    apply(last);
    guard.takeRecords(); // our own repair is not a new change
  });
  guard.observe(html, { attributes: true, attributeFilter: ["class", "style"] });

  return {
    apply,
    refresh() {
      injectStyles(doc, options.nonce);
      const settings = last;
      apply(DEFAULT_SETTINGS);
      apply(settings);
      guard.takeRecords();
    },
    setZIndex: pointer.setZIndex,
    destroy() {
      guard.disconnect();
      apply(DEFAULT_SETTINGS);
      if (!hadStyleAttr && !html.getAttribute("style")) html.removeAttribute("style");
    },
  };
}

/**
 * Font size: each text element's original size is measured once (with scaling
 * switched off) and stored as `data-a11yw-fs="<px × 100>"`. One generated rule per
 * distinct size multiplies it by `--a11yw-font`, so no inline styles are written.
 * New content is measured as it appears, so SPAs keep working.
 */
function createFontScaler(doc: Document, nonce?: string) {
  const html = doc.documentElement;
  const win = doc.defaultView!;
  const ATTR = "data-a11yw-fs";
  const FIELDS = "input, textarea, select";
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  const queue = new Set<Node>();
  const known = new Set<number>();
  let sheet: HTMLStyleElement | null = null;
  let observer: MutationObserver | null = null;
  let frame = 0;
  let resizeTimer = 0;
  let lastWidth = 0;

  const rule = (key: number) =>
    `html.a11yw-font [${ATTR}="${key}"]{font-size:calc(${key / 100}px * var(--a11yw-font))!important}`;

  /** Make sure a rule exists for every measured size (the page may have dropped our <style>). */
  const addRules = (keys: Iterable<number>) => {
    if (!sheet?.isConnected) {
      sheet = doc.createElement("style");
      sheet.id = "a11yw-font-sizes";
      if (nonce) sheet.nonce = nonce;
      sheet.textContent = [...known].map(rule).join("\n");
      doc.head.appendChild(sheet);
    }
    for (const key of keys) {
      if (known.has(key)) continue;
      known.add(key);
      if (sheet.sheet) sheet.sheet.insertRule(rule(key), sheet.sheet.cssRules.length);
      else sheet.textContent += `\n${rule(key)}`;
    }
  };

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
    const sizes = fresh.map((el) => Math.round(parseFloat(win.getComputedStyle(el).fontSize) * 100));
    const keys = new Set<number>();
    fresh.forEach((el, i) => {
      if (!(sizes[i] > 0)) return;
      el.setAttribute(ATTR, String(sizes[i]));
      keys.add(sizes[i]);
    });
    addRules(keys);
    html.classList.add("a11yw-font");
  };

  const clear = () => doc.querySelectorAll(`[${ATTR}]`).forEach((el) => el.removeAttribute(ATTR));

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

  // Responsive sites change base sizes per breakpoint, so re-measure after the width changes.
  // (Mobile browsers fire `resize` while scrolling as the URL bar moves; height-only changes are ignored.)
  const onResize = () => {
    if (win.innerWidth === lastWidth) return;
    lastWidth = win.innerWidth;
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
    sheet?.remove();
    sheet = null;
    known.clear();
    html.classList.remove("a11yw-font");
    html.style.removeProperty("--a11yw-font");
  };

  return {
    set(percent: number) {
      if (percent === 100) return disable();
      html.style.setProperty("--a11yw-font", String(percent / 100));
      if (observer) {
        html.classList.add("a11yw-font");
        addRules([]);
        return;
      }
      measure([doc.body]);
      observer = new MutationObserver(onMutations);
      observer.observe(doc.body, { childList: true, subtree: true });
      lastWidth = win.innerWidth;
      win.addEventListener("resize", onResize);
    },
    /** False when the page removed the scaling class, variable or rules while scaling is on. */
    intact: () =>
      !observer ||
      (html.classList.contains("a11yw-font") && !!html.style.getPropertyValue("--a11yw-font") && !!sheet?.isConnected),
  };
}

type PointerTool = "guide" | "mask" | "magnifier";
const POINTER_TOOLS: PointerTool[] = ["guide", "mask", "magnifier"];
const TEXT_BLOCKS =
  "p,li,a,button,label,h1,h2,h3,h4,h5,h6,td,th,dt,dd,blockquote,figcaption,summary,legend,caption,span,input,textarea,select";

/** Reading guide, reading mask and text magnifier — follow the pointer and keyboard focus. */
function createPointerTools(doc: Document, zIndex: number) {
  const win = doc.defaultView!;
  const els: Partial<Record<PointerTool, HTMLDivElement>> = {};
  let layer: HTMLDivElement | null = null;
  let layerZ = String(zIndex - 1);
  let x = win.innerWidth / 2;
  let y = win.innerHeight / 2;
  let target: EventTarget | null = null;
  let lastTarget: EventTarget | null = null;
  let frame = 0;
  let listening = false;
  let dismissed = false;

  const updateMagnifier = (box: HTMLDivElement) => {
    if (dismissed) {
      box.hidden = true;
      return;
    }
    if (target !== lastTarget) {
      lastTarget = target;
      const block = target instanceof Element ? target.closest<HTMLElement>(TEXT_BLOCKS) : null;
      const text = !block || block.closest(IGNORE)
        ? ""
        : block instanceof HTMLInputElement || block instanceof HTMLTextAreaElement
          ? block.value || block.placeholder || block.labels?.[0]?.innerText || ""
          : block.innerText || "";
      box.textContent = text.replace(/\s+/g, " ").trim().slice(0, 300);
      box.hidden = !box.textContent;
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
    if (els.mask) els.mask.style.transform = `translateY(${y - els.mask.offsetHeight / 2}px)`;
    if (els.magnifier) updateMagnifier(els.magnifier);
  };

  const schedule = () => {
    if (!frame) frame = win.requestAnimationFrame(render);
  };

  const onMove = (e: PointerEvent) => {
    x = e.clientX;
    y = e.clientY;
    target = e.target;
    dismissed = false;
    schedule();
  };

  // Keyboard users: the tools move to whatever receives focus.
  const onFocus = (e: FocusEvent) => {
    const el = e.target;
    if (!(el instanceof Element) || el.closest(IGNORE)) return;
    const r = el.getBoundingClientRect();
    x = r.left + Math.min(r.width / 2, 120);
    y = r.top + r.height / 2;
    target = el;
    dismissed = false;
    schedule();
  };

  // Escape dismisses the magnifier until the pointer or focus moves again (WCAG 1.4.13).
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !els.magnifier || els.magnifier.hidden) return;
    dismissed = true;
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
          if (!layer?.isConnected) {
            layer = doc.createElement("div");
            layer.className = "a11yw-ignore a11yw-layer";
            layer.setAttribute("aria-hidden", "true");
            layer.style.setProperty("--a11yw-layer-z", layerZ);
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
        doc.addEventListener("focusin", onFocus);
        doc.addEventListener("keydown", onKey);
        doc.documentElement.addEventListener("pointerleave", onLeave);
      } else if (!active && listening) {
        doc.removeEventListener("pointermove", onMove);
        doc.removeEventListener("focusin", onFocus);
        doc.removeEventListener("keydown", onKey);
        doc.documentElement.removeEventListener("pointerleave", onLeave);
        win.cancelAnimationFrame(frame);
        frame = 0;
        layer?.remove();
        layer = null;
      }
      listening = active;
      if (active) schedule();
    },
    setZIndex(z: number) {
      layerZ = String(z - 1);
      layer?.style.setProperty("--a11yw-layer-z", layerZ);
    },
  };
}

type ActivationNavigator = Navigator & { userActivation?: { isActive: boolean } };
/** True while handling a click / key press, i.e. the visitor started this themselves. */
const userStarted = () => (navigator as ActivationNavigator).userActivation?.isActive === true;

/**
 * Mutes page media and pauses playing videos. Media that starts later is caught too,
 * unless the visitor started or unmuted it themselves — that choice is always kept.
 */
function createMediaControl(doc: Document) {
  const mutedByUs = new Set<HTMLMediaElement>();
  const pausedByUs = new Set<HTMLVideoElement>();
  const unmutedByVisitor = new WeakSet<HTMLMediaElement>();
  let muting = false;
  let pausing = false;
  let listening = false;

  const track = <T extends HTMLMediaElement>(set: Set<T>, m: T) => {
    set.forEach((old) => !old.isConnected && set.delete(old)); // don't keep removed elements alive
    set.add(m);
  };
  const mute = (m: HTMLMediaElement) => {
    if (m.muted || m.closest(IGNORE) || unmutedByVisitor.has(m)) return;
    m.muted = true;
    track(mutedByUs, m);
  };
  const pause = (v: HTMLVideoElement) => {
    if (v.paused || v.closest(IGNORE)) return;
    v.pause();
    track(pausedByUs, v);
  };

  const onPlay = (e: Event) => {
    const m = e.target;
    if (!(m instanceof HTMLMediaElement) || userStarted()) return;
    if (muting) mute(m);
    if (pausing && m instanceof HTMLVideoElement) pause(m);
  };
  const onVolume = (e: Event) => {
    const m = e.target;
    if (!(m instanceof HTMLMediaElement) || m.muted || !muting) return;
    if (userStarted()) {
      mutedByUs.delete(m);
      unmutedByVisitor.add(m);
    } else {
      mute(m); // a script un-muted it on its own
    }
  };

  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    // `play` and `volumechange` don't bubble; capture catches them all.
    if (on) {
      doc.addEventListener("play", onPlay, true);
      doc.addEventListener("volumechange", onVolume, true);
    } else {
      doc.removeEventListener("play", onPlay, true);
      doc.removeEventListener("volumechange", onVolume, true);
    }
  };

  return {
    set(muteSounds: boolean, pauseVideos: boolean) {
      if (muteSounds !== muting) {
        muting = muteSounds;
        if (muting) doc.querySelectorAll<HTMLMediaElement>("audio, video").forEach(mute);
        else {
          mutedByUs.forEach((m) => (m.muted = false));
          mutedByUs.clear();
        }
      }

      if (pauseVideos !== pausing) {
        pausing = pauseVideos;
        if (pausing) doc.querySelectorAll<HTMLVideoElement>("video").forEach(pause);
        else {
          // Resume only silent videos (background loops); never restart something with sound.
          pausedByUs.forEach((v) => v.isConnected && v.muted && v.play().catch(() => {}));
          pausedByUs.clear();
        }
      }
      listen(muting || pausing);
    },
  };
}
