import type { AccessibilityWidgetOptions } from "open-accessibility-widget";
import { STATEMENT_URL } from "@/lib/site";
import type { Dir } from "@/types";

/** The site's brand teal: white text on it is 5.5:1. The playground's first swatch. */
export const SITE_PRIMARY = "#0f766e";

/**
 * Options of the widget running on this site (SiteWidget). The launcher sits on the inline-end side (right in
 * English, left in Arabic), away from the docs sidebar. The playground changes the options at runtime with
 * `widget.setOptions()` and puts these back when it unmounts. No `language`: the widget follows the page's
 * <html lang> until the visitor picks a language in its own menu.
 */
export const siteWidgetOptions = (dir: Dir) =>
  ({
    position: dir === "rtl" ? "left" : "right",
    theme: { primary: SITE_PRIMARY, onPrimary: "#ffffff" },
    buttonSize: 56,
    statementUrl: STATEMENT_URL,
  }) as const satisfies AccessibilityWidgetOptions;
