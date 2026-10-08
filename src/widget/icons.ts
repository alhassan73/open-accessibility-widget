// 24×24 stroke icons. These are static strings owned by the library (never user input),
// written as self-closing shapes only.
const ICONS = {
  accessibility:
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="6.8" r="1.5" fill="currentColor" stroke="none"/><path d="M7 9.6c1.7.5 3.3.7 5 .7s3.3-.2 5-.7M12 10.3v3.6m0 0-2.4 4.4m2.4-4.4 2.4 4.4"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A5.6 5.6 0 0 0 22 10c0-4.4-4.5-8-10-8z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  ear: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  glasses:
    '<circle cx="6.5" cy="15" r="3.5"/><circle cx="17.5" cy="15" r="3.5"/><path d="M10 15h4M3 15l1.5-7.5A2 2 0 0 1 6.5 6M21 15l-1.5-7.5A2 2 0 0 0 17.5 6"/>',
  scale: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  fontSize: '<path d="M4 7V4h10v3M9 4v16M7 20h4M14 13v-2h7v2M17.5 11v9M16 20h3"/>',
  lineHeight: '<path d="M11 6h10M11 12h10M11 18h10M5 4v16M3 6l2-2 2 2M3 18l2 2 2-2"/>',
  letterSpacing: '<path d="M4 4v16M20 4v16M8 12h8M10 10l-2 2 2 2M14 10l2 2-2 2"/>',
  align: '<path d="M3 6h18M3 12h12M3 18h16"/>',
  font: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>',
  drop: '<path d="M12 2.7 17.7 8.4a8 8 0 1 1-11.3 0z"/>',
  heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  magnifier: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  guide: '<rect x="2" y="10" width="20" height="5" rx="1.5"/><path d="M12 4v4M10 6l2 2 2-2"/>',
  mask: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/>',
  book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  mute: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/>',
  imageOff: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21M3 3l18 18"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  focus: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>',
  pointer: '<path d="m4 3 7 17 2.5-7.5L21 10z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
} as const;

export type IconName = keyof typeof ICONS;

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_ATTRS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false",
};

const svgEl = (tag: string, attrs: Record<string, string>) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
};

/**
 * Built with createElementNS rather than innerHTML, so the widget also runs on pages
 * that enforce Trusted Types. Icon markup is a flat list of self-closing shapes.
 */
export function icon(name: IconName, className?: string): SVGSVGElement {
  const svg = svgEl("svg", SVG_ATTRS) as SVGSVGElement;
  for (const [, tag, attrs] of ICONS[name].matchAll(/<(\w+)([^>]*)\/>/g)) {
    svg.appendChild(svgEl(tag, Object.fromEntries(Array.from(attrs.matchAll(/([\w-]+)="([^"]*)"/g), (m) => [m[1], m[2]]))));
  }
  if (className) svg.setAttribute("class", className);
  return svg;
}
