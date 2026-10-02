type Child = Node | string | null | undefined | false;
type Props = Record<string, unknown>;

/** Tiny element factory. Strings become text nodes, so they are never parsed as HTML. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === "className") {
      el.className = String(value);
    } else if (key === "style" && typeof value === "object") {
      for (const [prop, v] of Object.entries(value as Record<string, unknown>)) {
        if (v != null) el.style.setProperty(prop, String(v));
      }
    } else {
      el.setAttribute(key, value === true ? "" : String(value));
    }
  }
  el.append(...children.filter((c): c is Node | string => c != null && c !== false));
  return el;
}

let counter = 0;
export const uid = (prefix = "a11yw") => `${prefix}-${++counter}`;

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled && el.getClientRects().length > 0
  );
}

/** Keep Tab / Shift+Tab inside `root`. Returns true when the event was handled. */
export function trapTab(e: KeyboardEvent, root: HTMLElement): boolean {
  if (e.key !== "Tab") return false;
  const items = focusableIn(root);
  if (!items.length) return false;
  const first = items[0];
  const last = items[items.length - 1];
  const current = document.activeElement;
  const outside = !root.contains(current);
  if (e.shiftKey && (current === first || outside)) {
    e.preventDefault();
    last.focus();
    return true;
  }
  if (!e.shiftKey && (current === last || outside)) {
    e.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

/** Element for a user-supplied logo: an image URL, or a clone of a DOM element. */
export function logoNode(source: string | Element): Node {
  if (typeof source === "string") return h("img", { src: source, alt: "" });
  const clone = source.cloneNode(true) as Element;
  clone.setAttribute("aria-hidden", "true");
  return clone;
}
