import localFont from "next/font/local";

// The site fonts, self-hosted from the @fontsource packages through next/font: the Latin files are preloaded,
// and each family gets a fallback with matching metrics (size-adjust, ascent and descent overrides), so the
// text doesn't reflow when the web font arrives. One font per script: Plus Jakarta Sans for Latin text,
// IBM Plex Sans Arabic for Arabic (only its Arabic subset; it isn't preloaded, so English pages don't download
// it). Plex has no 800: its 700 face serves the 800 headings too, so the browser never fakes a heavier weight.
// The unicode ranges are the subsets' own (from @fontsource). next/font needs every option as a literal.
// Put both variables on <html> (`fontVariables`) and use --site-font, which lists the Arabic font first: its
// unicode-range limits it to Arabic, while Jakarta's fallback face (Arial, no unicode-range, has Arabic glyphs)
// would otherwise draw the Arabic text before the Arabic font is ever reached.

const jakarta = localFont({
  src: [
    {
      path: "../../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2",
      weight: "700",
    },
    {
      path: "../../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2",
      weight: "800",
    },
  ],
  variable: "--font-jakarta",
  display: "swap",
  adjustFontFallback: "Arial",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});

const plexArabic = localFont({
  src: [
    {
      path: "../../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2",
      weight: "700",
    },
  ],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
  // No generated fallback face: it would have no unicode-range, so listed first it would take the Latin text too.
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC",
    },
  ],
});

export const fontVariables = `${jakarta.variable} ${plexArabic.variable}`;
