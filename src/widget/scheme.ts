import { contrast } from "../settings";

/** Our own color adjustments: while one is on, the page looks the way we made it, not the site. */
const OWN = ["a11yw-dark", "a11yw-light", "a11yw-bg-color"];

let ctx: CanvasRenderingContext2D | null | undefined;
/** Any CSS color (rgb, oklch, named…) as `#rrggbb`, or `null` when it is mostly transparent. */
function toHex(color: string): string | null {
  ctx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a < 128 ? null : `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Is the page dark? Judged by what the site paints behind its content (body, html, then the app
 * shell under the middle of the screen), so it works however the site switches themes: a class, a
 * data attribute or a media query. `null` while our own color adjustments are on.
 */
function pageIsDark(): boolean | null {
  const html = document.documentElement;
  if (OWN.some((c) => html.classList.contains(c))) return null;
  const shell = document.elementsFromPoint(innerWidth / 2, innerHeight / 2).reverse();
  for (const el of [document.body, html, ...shell]) {
    if (!el || el.closest(".a11yw-ignore")) continue;
    const hex = toHex(getComputedStyle(el).backgroundColor);
    if (hex) return contrast(hex, "#ffffff")! > contrast(hex, "#000000")!;
  }
  // Nothing painted: the browser's canvas, dark only when the page opted into a dark color scheme.
  const scheme = getComputedStyle(html).colorScheme;
  return /\bdark\b/.test(scheme) && (!/\blight\b/.test(scheme) || matchMedia("(prefers-color-scheme: dark)").matches);
}

/**
 * For `colorScheme: "auto"`: tells `onChange` when the page turns dark or light (right away if it
 * is dark now). Looks again when `<html>` / `<body>` attributes change or the OS theme changes, and
 * once more after a moment, since theme switches often fade the background. Returns the undo.
 */
export function watchPageScheme(onChange: (dark: boolean) => void): () => void {
  let dark = false;
  let soon = 0;
  let later = 0;
  const check = () => {
    const next = pageIsDark();
    if (next === null || next === dark) return;
    dark = next;
    onChange(dark);
  };
  const schedule = () => {
    clearTimeout(soon);
    clearTimeout(later);
    soon = window.setTimeout(check, 50);
    later = window.setTimeout(check, 600);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { attributes: true });
  observer.observe(document.body, { attributes: true });
  const media = matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", schedule);
  check();
  return () => {
    observer.disconnect();
    media.removeEventListener("change", schedule);
    clearTimeout(soon);
    clearTimeout(later);
  };
}
