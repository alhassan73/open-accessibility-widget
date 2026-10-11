import { DEFAULT_SETTINGS, isDefaultSettings } from "../settings";
import type { AccessibilitySettings } from "../types";
import { injectStyles, removeStyles, STYLE_ID } from "./css";
import { adopt, createShadowRoots } from "./shadow";

export interface EngineOptions {
  /** CSP nonce for injected `<style>` tags. */
  nonce?: string;
  /** The widget's z-index; pointer tools are stacked just below it. */
  zIndex?: number;
  /** The document is a same-origin iframe of the page: the page's own layers already cover it. */
  inFrame?: boolean;
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
  const zIndex = options.zIndex ?? DEFAULT_Z;
  // The callbacks run only after everything below exists (shadow roots are found in `apply`).
  const shadow = createShadowRoots(doc, {
    found(root) {
      font.add(root);
      media.add(root);
      frames.listen(root);
    },
    gone: (root) => font.remove(root),
    changed: (added) => frames.changed(added),
  });
  const font = createFontScaler(doc, shadow.roots, options.nonce);
  // In a frame, reading aids and color filters come from the page around it.
  const pointer = options.inFrame ? null : createPointerTools(doc, zIndex);
  const backdrop = options.inFrame ? null : createBackdrop(doc, zIndex);
  const media = createMediaControl(doc, shadow.roots);
  const motion = createMotionControl(doc, shadow.roots);
  const speech = createSpeech(doc);
  const frames = createFrames(doc, shadow.roots, options.nonce, pointer);
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
    const on = !isDefaultSettings(s);
    if (on) shadow.watch(true); // first, so the steps below reach the shadow roots
    const spacing = s.letterSpacing !== 100 && (s.letterSpacing - 100) / 100;
    // A frame is scaled with the page around it.
    flag("scale", !options.inFrame && s.contentScale !== 100 && String(s.contentScale / 100));
    flag("lh", s.lineHeight !== 100 && String(1.5 * (s.lineHeight / 100)));
    flag("ls", spacing !== false && `${spacing * 0.2}em`);
    setVar("ws", spacing !== false && `${spacing * 0.3}em`);
    flag("align", s.textAlign !== "default" && s.textAlign);
    flag("readable", s.readableFont);
    flag("bold", s.boldText);
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

    // Invert comes from the layer below the widget; media are inverted first, so they end up as they were.
    // In a frame, the page around it already inverts it.
    const invert = !options.inFrame && s.invertColors;
    flag("invert", invert);
    const filters = [
      invert && "invert(1) hue-rotate(180deg)",
      s.colorMode === "high-contrast" && "contrast(1.4)",
      s.saturationMode === "monochrome" && "grayscale(1)",
      s.saturationMode === "low-saturation" && "saturate(0.5)",
      s.saturationMode === "high-saturation" && "saturate(2)",
    ].filter(Boolean);
    flag("filter", filters.length > 0 && filters.join(" "));
    backdrop?.set(filters.length > 0);

    font.set(s.fontSize);
    pointer?.set({ guide: s.readingGuide, mask: s.readingMask, magnifier: s.textMagnifier });
    media.set(s.muteSounds, s.stopAnimations);
    motion.set(s.stopAnimations);
    speech.set(s.readAloud);
    shadow.style();
    frames.apply(on && s);
    if (!on) shadow.watch(false); // last, after the steps above left the shadow roots
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
    setZIndex(zIndex) {
      pointer?.setZIndex(zIndex);
      backdrop?.setZIndex(zIndex);
    },
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
 * New content is measured as it appears, so SPAs keep working. Text in open shadow roots
 * is measured too, and each root adopts a copy of the rules.
 */
function createFontScaler(doc: Document, roots: ReadonlySet<ShadowRoot>, nonce?: string) {
  const html = doc.documentElement;
  const win = doc.defaultView!;
  const ATTR = "data-a11yw-fs";
  const FIELDS = "input, textarea, select";
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  const queue = new Set<Node>();
  const known = new Set<number>();
  // The rules for shadow roots; switched off while measuring, like the class on <html>.
  const shadowSheet = new win.CSSStyleSheet();
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
      shadowSheet.insertRule(rule(key).replace("html.a11yw-font", ":host"), shadowSheet.cssRules.length);
    }
  };

  const measure = (nodes: Iterable<Node>) => {
    const targets = new Set<HTMLElement>();
    for (const node of nodes) {
      if (!node.isConnected) continue;
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue?.trim() && node.parentElement) targets.add(node.parentElement);
        continue;
      }
      // An element (not the widget's) or a shadow root. No `instanceof`: frames are other realms.
      const el = node.nodeType === 1 ? (node as HTMLElement) : null;
      if (el ? el.closest(IGNORE) : node.nodeType !== 11) continue;
      const walker = doc.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.nodeValue?.trim() && n.parentElement) targets.add(n.parentElement);
      }
      if (el?.matches(FIELDS)) targets.add(el);
      (node as ParentNode).querySelectorAll<HTMLElement>(FIELDS).forEach((f) => targets.add(f));
    }

    const fresh = [...targets].filter(
      (el) => !el.hasAttribute(ATTR) && !SKIP.has(el.tagName) && !el.closest(IGNORE)
    );
    if (!fresh.length) return;

    // Read every size first with scaling off, then write — one layout pass.
    html.classList.remove("a11yw-font");
    shadowSheet.disabled = true;
    const sizes = fresh.map((el) => Math.round(parseFloat(win.getComputedStyle(el).fontSize) * 100));
    const keys = new Set<number>();
    fresh.forEach((el, i) => {
      if (!(sizes[i] > 0)) return;
      el.setAttribute(ATTR, String(sizes[i]));
      keys.add(sizes[i]);
    });
    addRules(keys);
    html.classList.add("a11yw-font");
    shadowSheet.disabled = false;
  };

  const pageRoots = () => [doc.body, ...roots];
  const clear = () =>
    [doc, ...roots].forEach((r) => r.querySelectorAll(`[${ATTR}]`).forEach((el) => el.removeAttribute(ATTR)));

  const flush = () => {
    frame = 0;
    const nodes = [...queue];
    queue.clear();
    measure(nodes);
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
      measure(pageRoots());
    }, 250);
  };

  /** Start scaling inside a shadow root: adopt the rules, follow new content, measure with the next batch. */
  const addRoot = (root: ShadowRoot) => {
    adopt(root, shadowSheet, true);
    observer!.observe(root, { childList: true, subtree: true });
    queue.add(root);
    if (!frame) frame = win.requestAnimationFrame(flush);
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
    shadowSheet.replaceSync(""); // also for removed roots that still hold it
    roots.forEach((root) => adopt(root, shadowSheet, false));
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
      roots.forEach(addRoot);
      lastWidth = win.innerWidth;
      win.addEventListener("resize", onResize);
    },
    /** A shadow root found after scaling started. */
    add(root: ShadowRoot) {
      if (observer) addRoot(root);
    },
    /** A shadow root that left the page: leave nothing behind in it. */
    remove(root: ShadowRoot) {
      adopt(root, shadowSheet, false);
      root.querySelectorAll(`[${ATTR}]`).forEach((el) => el.removeAttribute(ATTR));
    },
    /** False when the page removed the scaling class, variable or rules while scaling is on. */
    intact: () =>
      !observer ||
      (html.classList.contains("a11yw-font") && !!html.style.getPropertyValue("--a11yw-font") && !!sheet?.isConnected),
  };
}

/**
 * Color filters (saturation, high contrast) live on a page-wide `backdrop-filter` layer
 * stacked just below the widget: it recolors everything behind it — fixed headers included —
 * but never the widget. (A `filter` on <html> would recolor the widget too.)
 */
function createBackdrop(doc: Document, zIndex: number) {
  let el: HTMLDivElement | null = null;
  let z = String(zIndex - 2);
  return {
    set(on: boolean) {
      if (on && !el?.isConnected) {
        el = doc.createElement("div");
        el.className = "a11yw-ignore a11yw-backdrop";
        el.setAttribute("aria-hidden", "true");
        el.style.zIndex = z;
        doc.body.appendChild(el);
      } else if (!on && el) {
        el.remove();
        el = null;
      }
    },
    setZIndex(next: number) {
      z = String(next - 2);
      if (el) el.style.zIndex = z;
    },
  };
}

type PointerTool = "guide" | "mask" | "magnifier";
type PointerTools = ReturnType<typeof createPointerTools>;
const POINTER_TOOLS: PointerTool[] = ["guide", "mask", "magnifier"];
const TEXT_BLOCKS =
  "p,li,a,button,label,h1,h2,h3,h4,h5,h6,td,th,dt,dd,blockquote,figcaption,summary,legend,caption,span,input,textarea,select";

/**
 * What the magnifier shows and read-aloud says for the element under the pointer or focus: an image's
 * alt text, else its text block (a field's value, placeholder or label). Never the widget's own text.
 * No `instanceof`: the element may be in a frame (another realm).
 */
function readableText(target: EventTarget | null): string {
  if ((target as Node | null)?.nodeType !== 1) return "";
  const el = target as Element;
  if (el.closest(IGNORE)) return "";
  const img = el.closest('img,[role="img"]');
  let text = img?.getAttribute("alt") || img?.getAttribute("aria-label") || "";
  if (!text) {
    const block = el.closest<HTMLElement>(TEXT_BLOCKS);
    const field = block as HTMLInputElement | null;
    text = !block
      ? ""
      : block.matches("input,textarea")
        ? field!.value || field!.placeholder || field!.labels?.[0]?.innerText || ""
        : block.innerText || "";
  }
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Read aloud: a click or tap on the page, or keyboard focus, reads that block (or image's alt text)
 * with the browser's own speech, in the language of that part of the page. Escape stops it. Nothing
 * leaves the browser except what the operating system's voices do.
 */
function createSpeech(doc: Document) {
  const win = doc.defaultView!;
  const synth = win.speechSynthesis as SpeechSynthesis | undefined;
  let on = false;

  const speak = (target: EventTarget | null) => {
    const text = readableText(target).slice(0, 2000);
    if (!text || !synth) return;
    synth.cancel();
    const utterance = new win.SpeechSynthesisUtterance(text);
    utterance.lang = (target as Element).closest("[lang]")?.getAttribute("lang") || "";
    synth.speak(utterance);
  };
  const onClick = (e: MouseEvent) => speak(e.composedPath()[0]);
  const onFocus = (e: FocusEvent) => {
    const el = e.composedPath()[0] as Element;
    if (el.nodeType === 1 && el.matches(":focus-visible")) speak(el);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") synth?.cancel();
  };

  return {
    set(next: boolean) {
      if (!synth || next === on) return;
      on = next;
      const fn = on ? doc.addEventListener.bind(doc) : doc.removeEventListener.bind(doc);
      fn("click", onClick as EventListener);
      fn("focusin", onFocus as EventListener);
      fn("keydown", onKey as EventListener);
      if (!on) synth.cancel();
    },
  };
}

/**
 * Reading guide, reading mask and text magnifier — follow the pointer (on touch screens, a tap)
 * and keyboard focus, also inside open shadow roots and same-origin frames.
 */
function createPointerTools(doc: Document, zIndex: number) {
  const win = doc.defaultView!;
  const els: Partial<Record<PointerTool, HTMLDivElement>> = {};
  /** Same-origin frames: their document and listeners. */
  const frames = new Set<[Document, (e: PointerEvent) => void, (e: FocusEvent) => void]>();
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
      box.textContent = readableText(target).slice(0, 300);
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

  /** Move the tools to a point of the viewport, over `el`. */
  const moveTo = (px: number, py: number, el: EventTarget | null) => {
    x = px;
    y = py;
    target = el;
    dismissed = false;
    schedule();
  };

  // `composedPath()[0]` is the element itself, also inside an open shadow root.
  const onMove = (e: PointerEvent) => moveTo(e.clientX, e.clientY, e.composedPath()[0]);

  // Keyboard users: the tools move to whatever receives focus. `toPage`: from a frame's coordinates.
  const onFocus = (e: FocusEvent, toPage = (fx: number, fy: number): [number, number] => [fx, fy]) => {
    const el = e.composedPath()[0] as Element;
    if (el.nodeType !== 1 || el.closest(IGNORE)) return;
    const r = el.getBoundingClientRect();
    moveTo(...toPage(r.left + Math.min(r.width / 2, 120), r.top + r.height / 2), el);
  };

  // Escape dismisses the magnifier until the pointer or focus moves again (WCAG 1.4.13).
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !els.magnifier || els.magnifier.hidden) return;
    dismissed = true;
    schedule();
  };

  // A touch pointer leaves after every tap: the magnifier keeps showing what was tapped.
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    target = null;
    schedule();
  };

  const listen = (d: Document, on: boolean, move: (e: PointerEvent) => void, focus: (e: FocusEvent) => void) => {
    const fn = on ? d.addEventListener.bind(d) : d.removeEventListener.bind(d);
    fn("pointermove", move as EventListener, { passive: true });
    fn("pointerdown", move as EventListener, { passive: true });
    fn("focusin", focus as EventListener);
    fn("keydown", onKey as EventListener);
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
      if (active !== listening) {
        listen(doc, active, onMove, onFocus);
        frames.forEach(([d, move, focus]) => listen(d, active, move, focus));
        if (active) doc.documentElement.addEventListener("pointerleave", onLeave);
        else doc.documentElement.removeEventListener("pointerleave", onLeave);
      }
      if (!active && listening) {
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
    /** Follow the pointer and focus inside a same-origin frame too. Returns the undo. */
    frame(el: HTMLIFrameElement, d: Document) {
      // Frame coordinates → page viewport. Page zoom (content scale) or a transform scales the frame.
      const toPage = (fx: number, fy: number): [number, number] => {
        const r = el.getBoundingClientRect();
        const sx = r.width / el.offsetWidth || 1;
        const sy = r.height / el.offsetHeight || 1;
        return [r.left + (el.clientLeft + fx) * sx, r.top + (el.clientTop + fy) * sy];
      };
      const entry: [Document, (e: PointerEvent) => void, (e: FocusEvent) => void] = [
        d,
        (e) => moveTo(...toPage(e.clientX, e.clientY), e.composedPath()[0]),
        (e) => onFocus(e, toPage),
      ];
      frames.add(entry);
      if (listening) listen(d, true, entry[1], entry[2]);
      return () => {
        frames.delete(entry);
        listen(d, false, entry[1], entry[2]);
      };
    },
  };
}

type ActivationNavigator = Navigator & { userActivation?: { isActive: boolean } };
/** True while handling a click / key press, i.e. the visitor started this themselves. */
const userStarted = () => (navigator as ActivationNavigator).userActivation?.isActive === true;

/**
 * Mutes page media and pauses playing videos, also inside open shadow roots. Media that starts later
 * is caught too, unless the visitor started or unmuted it themselves — that choice is always kept.
 */
function createMediaControl(doc: Document, roots: ReadonlySet<ShadowRoot>) {
  // The document's own constructor: in a frame, `instanceof HTMLMediaElement` would be false.
  const Media = doc.defaultView!.HTMLMediaElement;
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
  const all = <T extends Element>(selector: string) =>
    [doc, ...roots].flatMap((r) => Array.from(r.querySelectorAll<T>(selector)));

  const onPlay = (e: Event) => {
    const m = e.target;
    if (!(m instanceof Media) || userStarted()) return;
    if (muting) mute(m);
    if (pausing && m.tagName === "VIDEO") pause(m as HTMLVideoElement);
  };
  const onVolume = (e: Event) => {
    const m = e.target;
    if (!(m instanceof Media) || m.muted || !muting) return;
    if (userStarted()) {
      mutedByUs.delete(m);
      unmutedByVisitor.add(m);
    } else {
      mute(m); // a script un-muted it on its own
    }
  };

  // `play` and `volumechange` don't bubble, nor leave a shadow root; capture on each catches them all.
  const listenOn = (target: Document | ShadowRoot, on: boolean) => {
    const fn = on ? target.addEventListener.bind(target) : target.removeEventListener.bind(target);
    fn("play", onPlay, true);
    fn("volumechange", onVolume, true);
  };
  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    [doc, ...roots].forEach((r) => listenOn(r, on));
  };

  return {
    set(muteSounds: boolean, pauseVideos: boolean) {
      if (muteSounds !== muting) {
        muting = muteSounds;
        if (muting) all<HTMLMediaElement>("audio, video").forEach(mute);
        else {
          mutedByUs.forEach((m) => (m.muted = false));
          mutedByUs.clear();
        }
      }

      if (pauseVideos !== pausing) {
        pausing = pauseVideos;
        if (pausing) all<HTMLVideoElement>("video").forEach(pause);
        else {
          // Resume only silent videos (background loops); never restart something with sound.
          pausedByUs.forEach((v) => v.isConnected && v.muted && v.play().catch(() => {}));
          pausedByUs.clear();
        }
      }
      listen(muting || pausing);
    },
    /** A shadow root found while the page is adjusted. */
    add(root: ShadowRoot) {
      if (!listening) return;
      listenOn(root, true);
      root.querySelectorAll<HTMLMediaElement>("audio, video").forEach((m) => {
        if (muting) mute(m);
        if (pausing && m.tagName === "VIDEO") pause(m as HTMLVideoElement);
      });
    },
  };
}

/**
 * "Stop animations" for motion that CSS can't stop: animations started by scripts (Web Animations
 * API) and SVG animations (SMIL). Like the CSS rules, finite ones jump to their end (so content that
 * fades or slides in still arrives, and `finished` still resolves); endless ones are paused, and only
 * those are resumed. New ones are caught once a second. Canvas and `requestAnimationFrame` loops
 * can't be stopped from outside.
 */
function createMotionControl(doc: Document, roots: ReadonlySet<ShadowRoot>) {
  const win = doc.defaultView!;
  const paused = new Set<Animation>();
  const svgs = new Set<SVGSVGElement>();
  let timer = 0;

  const sweep = () => {
    if (doc.hidden) return;
    // Forget what the page cancelled, finished or removed meanwhile.
    paused.forEach((a) => a.playState === "paused" || paused.delete(a));
    svgs.forEach((svg) => svg.isConnected || svgs.delete(svg));
    for (const r of [doc, ...roots]) {
      for (const a of r.getAnimations()) {
        const effect = a.effect as KeyframeEffect | null;
        // CSS animations and transitions are already handled by the stylesheet.
        if (a.playState !== "running" || "animationName" in a || "transitionProperty" in a || effect?.target?.closest(IGNORE)) continue;
        if (effect?.getComputedTiming().endTime !== Infinity) {
          try {
            a.finish();
          } catch {
            // A playback rate of 0 can't finish; the page made that animation stand still anyway.
          }
        } else {
          a.pause();
          paused.add(a);
        }
      }
      r.querySelectorAll("svg").forEach((svg) => {
        if (svg.animationsPaused() || !svg.querySelector("animate,animateMotion,animateTransform,set") || svg.closest(IGNORE)) return;
        svg.pauseAnimations();
        svgs.add(svg);
      });
    }
  };

  return {
    set(on: boolean) {
      if (on === !!timer) return;
      if (on) {
        sweep();
        timer = win.setInterval(sweep, 1000);
        return;
      }
      win.clearInterval(timer);
      timer = 0;
      paused.forEach((a) => a.playState === "paused" && a.play());
      svgs.forEach((svg) => svg.unpauseAnimations());
      paused.clear();
      svgs.clear();
    },
  };
}

/**
 * Same-origin iframes get an engine of their own with the same settings while the page is adjusted.
 * Cross-origin frames (video players, maps, payment forms) can't be reached by any script, and a frame
 * that runs its own copy of the widget is left to it.
 */
function createFrames(
  doc: Document,
  roots: ReadonlySet<ShadowRoot>,
  nonce: string | undefined,
  pointer: PointerTools | null
) {
  const frames = new Map<HTMLIFrameElement, { doc: Document; engine: Engine; undo?: () => void }>();
  let settings: AccessibilitySettings | null = null;

  const sync = (el: HTMLIFrameElement) => {
    const d = el.contentDocument; // null when cross-origin
    const cur = frames.get(el);
    if (cur && (cur.doc !== d || !settings || !el.isConnected)) {
      cur.engine.destroy();
      // The frame's own widget may have started meanwhile and now relies on the same <style>.
      if (!cur.doc.querySelector(".a11yw-root")) removeStyles(cur.doc);
      cur.undo?.();
      frames.delete(el);
    }
    if (!settings || !d?.body || !el.isConnected || frames.has(el) || el.closest(IGNORE)) return;
    if (d.getElementById(STYLE_ID)) return; // the frame's own widget
    const engine = createEngine(d, { nonce, inFrame: true });
    engine.apply(settings);
    frames.set(el, { doc: d, engine, undo: pointer?.frame(el, d) });
  };
  const syncIn = (r: ParentNode) => r.querySelectorAll("iframe").forEach(sync);

  // A frame that navigates gets a new document: follow it. (`load` doesn't leave a shadow root.)
  const onLoad = (e: Event) => {
    if ((e.target as Element).tagName === "IFRAME") sync(e.target as HTMLIFrameElement);
  };
  const listenOn = (target: Document | ShadowRoot, on: boolean) => {
    if (on) target.addEventListener("load", onLoad, true);
    else target.removeEventListener("load", onLoad, true);
  };

  return {
    apply(next: AccessibilitySettings | false) {
      if (!!next !== !!settings) [doc, ...roots].forEach((r) => listenOn(r, !!next));
      settings = next || null;
      frames.forEach(({ engine }) => settings && engine.apply(settings));
      frames.forEach((_, el) => sync(el));
      [doc, ...roots].forEach(syncIn);
    },
    /** A shadow root found while the page is adjusted. */
    listen(root: ShadowRoot) {
      if (!settings) return;
      listenOn(root, true);
      syncIn(root);
    },
    /** The page changed: release removed frames, start on added ones. */
    changed(added: Node[]) {
      if (!settings) return;
      frames.forEach((_, el) => el.isConnected || sync(el));
      for (const node of added) {
        if (node.nodeType !== 1) continue;
        if ((node as Element).tagName === "IFRAME") sync(node as HTMLIFrameElement);
        else syncIn(node as Element);
      }
    },
  };
}
