const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance of a `#rrggbb` color. */
function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

/** Black or white, whichever has more contrast on `hex` (a `#rrggbb` color): the text color for a brand fill. */
export function onColor(hex: string): "#101112" | "#ffffff" {
  const l = luminance(hex);
  // Contrast with white is 1.05 / (l + 0.05); with near-black (luminance ~0.006) it is (l + 0.05) / 0.056.
  return 1.05 / (l + 0.05) >= (l + 0.05) / 0.056 ? "#ffffff" : "#101112";
}
