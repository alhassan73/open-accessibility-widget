import { EFFECTS_CSS } from "./css";

const IGNORE = ".a11yw-ignore";

/**
 * `html.a11yw-x body …` prefixes of the page rules. Inside a shadow root there is no <html>, so the
 * prefixes of adjustments that are on become `:host`; the others stay and never match there.
 * Content scale is left out: zooming the host already scales what is inside it.
 * Caveat: `:host` rules are `!important` in the inner context, so they beat the page's own rules on
 * the host element. Today every rule gives the host the same value as the page rule does.
 */
const PREFIX = /html(\.a11yw-[\w-]+|:is\([^)]*\))( body)?/g;
export const shadowCss = (css: string, isOn: (cls: string) => boolean) =>
  css.replace(PREFIX, (m, cond: string) =>
    cond.match(/a11yw-[\w-]+/g)!.some((cls) => cls !== "a11yw-scale" && isOn(cls)) ? ":host" : m
  );

/** Add a sheet to a shadow root (last, so it wins) or take it out. */
export const adopt = (root: ShadowRoot, sheet: CSSStyleSheet, on: boolean) => {
  const rest = root.adoptedStyleSheets.filter((s) => s !== sheet);
  root.adoptedStyleSheets = on ? [...rest, sheet] : rest;
};

export interface ShadowHooks {
  /** A shadow root was found. */
  found(root: ShadowRoot): void;
  /** A shadow root left the page: release it. */
  gone(root: ShadowRoot): void;
  /** The page changed (one call per batch, with the added nodes). */
  changed(added: Node[]): void;
}

export interface ShadowRoots {
  /** The page's open shadow roots found so far (never the widget's). */
  readonly roots: ReadonlySet<ShadowRoot>;
  /** Start or stop looking for shadow roots; stopping takes the adjustments out of them. */
  watch(on: boolean): void;
  /** Re-style every root for the classes now on <html>. */
  style(): void;
}

/**
 * Open shadow roots (web components) keep page CSS out, so each one adopts a stylesheet with the
 * page rules rewritten for it. Roots are found in the page, in each other, and in content added
 * later. Closed shadow roots can't be reached.
 */
export function createShadowRoots(doc: Document, hooks: ShadowHooks): ShadowRoots {
  const win = doc.defaultView!;
  const roots = new Set<ShadowRoot>();
  // Constructed in the document's own window: a sheet can't be shared across documents.
  const sheet = new win.CSSStyleSheet();
  let watching = false;
  let rescan = 0;

  const add = (root: ShadowRoot) => {
    if (roots.has(root)) return;
    roots.add(root);
    adopt(root, sheet, true);
    observer.observe(root, { childList: true, subtree: true });
    hooks.found(root);
    scan(root);
  };

  const scan = (node: Node) => {
    if (node.nodeType === 1) {
      if ((node as Element).closest(IGNORE)) return;
      const own = (node as Element).shadowRoot;
      if (own) add(own);
    } else if (node.nodeType !== 11) return;
    (node as ParentNode).querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot && !el.closest(IGNORE)) add(el.shadowRoot);
    });
  };

  const observer = new MutationObserver((records) => {
    // Release removed components (they come back through `scan` if they are put back).
    roots.forEach((root) => {
      if (root.host.isConnected) return;
      roots.delete(root);
      adopt(root, sheet, false);
      hooks.gone(root);
    });
    const added: Node[] = [];
    for (const r of records) r.addedNodes.forEach((n) => added.push(n));
    added.forEach(scan);
    hooks.changed(added);
  });

  return {
    roots,
    watch(on) {
      win.clearTimeout(rescan);
      if (on && !watching) {
        watching = true;
        observer.observe(doc.body, { childList: true, subtree: true });
        scan(doc.body);
      } else if (on) {
        // A component defined later gets its shadow root without any DOM change: look again once
        // the settings stop changing (not on every step of a slider).
        rescan = win.setTimeout(() => watching && scan(doc.body), 500);
      } else if (watching) {
        watching = false;
        observer.disconnect();
        sheet.replaceSync(""); // also for removed roots that still hold it
        roots.forEach((root) => adopt(root, sheet, false));
        roots.clear();
      }
    },
    style() {
      if (watching) sheet.replaceSync(shadowCss(EFFECTS_CSS, (cls) => doc.documentElement.classList.contains(cls)));
    },
  };
}
