// API reference data for the API page. Names, types and defaults are code (English). The descriptions are
// translated and live in the messages, as `Api.rows.<group>.<id>`. Checked against src/types.ts, src/index.ts,
// src/react.ts and src/settings.ts.
import type { ApiGroup, ApiRow } from "@/types";

export const OPTIONS: ApiRow[] = [
  { id: "position", name: "position", type: '"left" | "right"', def: '"left"' },
  { id: "offset", name: "offset", type: "{ x?: number; y?: number }", def: "{ x: 24, y: 24 }" },
  { id: "theme", name: "theme", type: "AccessibilityTheme" },
  { id: "colorScheme", name: "colorScheme", type: '"auto" | "light" | "dark"', def: '"auto"' },
  { id: "icon", name: "icon", type: "string | Element", def: "built-in icon" },
  { id: "logo", name: "logo", type: "string | Element | null", def: "hidden" },
  { id: "buttonSize", name: "buttonSize", type: "number", def: "56" },
  { id: "features", name: "features", type: "Partial<Record<FeatureKey, boolean>>", def: "all on" },
  { id: "initialSettings", name: "initialSettings", type: "Partial<AccessibilitySettings>" },
  { id: "languages", name: "languages", type: "AccessibilityLanguage[] | false", def: "English + Arabic" },
  { id: "language", name: "language", type: "string", def: "saved → <html lang> → first" },
  { id: "labels", name: "labels", type: "Partial<AccessibilityLabels>" },
  { id: "dir", name: "dir", type: '"ltr" | "rtl"', def: "language's direction" },
  { id: "shortcut", name: "shortcut", type: "string | false", def: '"Alt+A"' },
  { id: "statementUrl", name: "statementUrl", type: "string" },
  { id: "showSkipLink", name: "showSkipLink", type: "boolean", def: "true" },
  { id: "zIndex", name: "zIndex", type: "number", def: "2147483000" },
  { id: "persist", name: "persist", type: "boolean", def: "true" },
  { id: "storageKey", name: "storageKey", type: "string", def: '"a11yw-settings"' },
  { id: "nonce", name: "nonce", type: "string" },
  { id: "onChange", name: "onChange", type: "(settings) => void" },
];

export const THEME: ApiRow[] = [
  { id: "primary", name: "primary", type: "string" },
  { id: "onPrimary", name: "onPrimary", type: "string" },
  { id: "background", name: "background", type: "string" },
  { id: "surface", name: "surface", type: "string" },
  { id: "text", name: "text, mutedText", type: "string" },
  { id: "border", name: "border", type: "string" },
  { id: "radius", name: "radius", type: "number | string" },
  { id: "fontFamily", name: "fontFamily", type: "string" },
];

export const METHODS: ApiRow[] = [
  { id: "open", name: "open(), close(), toggle()", type: "void" },
  { id: "getSettings", name: "getSettings()", type: "AccessibilitySettings" },
  { id: "getState", name: "getState()", type: "AccessibilityState" },
  { id: "setSettings", name: "setSettings(update)", type: "void" },
  { id: "toggleProfile", name: "toggleProfile(id)", type: "void" },
  { id: "reset", name: "reset()", type: "void" },
  { id: "setOptions", name: "setOptions(options)", type: "void" },
  { id: "subscribe", name: "subscribe(listener)", type: "() => void" },
  { id: "destroy", name: "destroy()", type: "void" },
];

export const REACT: ApiRow[] = [
  { id: "component", name: "<AccessibilityWidget {...options} />", type: "null" },
  { id: "hook", name: "useAccessibility()", type: "{ settings, isOpen, widget }" },
];

export const EXPORTS: ApiRow[] = [
  { id: "init", name: "init(options), createAccessibilityWidget(options)", type: "AccessibilityWidgetInstance" },
  { id: "getAccessibilityWidget", name: "getAccessibilityWidget()", type: "AccessibilityWidgetInstance | null" },
  { id: "onActiveWidgetChange", name: "onActiveWidgetChange(listener)", type: "() => void" },
  { id: "defaults", name: "DEFAULT_SETTINGS", type: "Readonly<AccessibilitySettings>" },
  { id: "ranges", name: "RANGES", type: "Record<RangeKey, { min, max, step }>" },
  { id: "profiles", name: "PROFILE_IDS, PROFILE_PRESETS", type: "ProfileId[], Record<ProfileId, ProfilePreset>" },
  { id: "sanitize", name: "sanitizeSettings(input)", type: "AccessibilitySettings" },
  { id: "languages", name: "builtInLanguages", type: "AccessibilityLanguage[]" },
  { id: "labels", name: "defaultLabels, arabicLabels", type: "AccessibilityLabels" },
];

export const SETTINGS: ApiRow[] = [
  { id: "profiles", name: "profiles", type: "ProfileId[]", def: "[]" },
  { id: "contentScale", name: "contentScale", type: "number (50–200)", def: "100" },
  { id: "fontSize", name: "fontSize", type: "number (50–200)", def: "100" },
  { id: "lineHeight", name: "lineHeight", type: "number (100–200)", def: "100" },
  { id: "letterSpacing", name: "letterSpacing", type: "number (100–200)", def: "100" },
  { id: "textAlign", name: "textAlign", type: '"default" | "left" | "center" | "right" | "justify"', def: '"default"' },
  { id: "readableFont", name: "readableFont", type: "boolean", def: "false" },
  { id: "highlight", name: "highlightTitles, highlightLinks", type: "boolean", def: "false" },
  { id: "textMagnifier", name: "textMagnifier", type: "boolean", def: "false" },
  {
    id: "colorMode",
    name: "colorMode",
    type: '"default" | "dark-contrast" | "light-contrast" | "high-contrast"',
    def: '"default"',
  },
  {
    id: "saturationMode",
    name: "saturationMode",
    type: '"default" | "monochrome" | "low-saturation" | "high-saturation"',
    def: '"default"',
  },
  { id: "colors", name: "textColor, titleColor, backgroundColor", type: '"#rrggbb" | null', def: "null" },
  { id: "media", name: "muteSounds, hideImages, stopAnimations", type: "boolean", def: "false" },
  { id: "guides", name: "readingGuide, readingMask", type: "boolean", def: "false" },
  { id: "focus", name: "highlightFocus, highlightHover", type: "boolean", def: "false" },
  { id: "cursor", name: "cursor", type: '"default" | "black" | "white"', def: '"default"' },
];

export const ENTRY_POINTS: ApiRow[] = [
  { id: "core", name: "open-accessibility-widget", type: "ESM + CJS + .d.ts" },
  { id: "react", name: "open-accessibility-widget/react", type: "ESM + CJS + .d.ts" },
  { id: "global", name: "dist/open-accessibility-widget.global.js", type: "IIFE" },
];

/** The tables of the API page, in page order. The group is also the section's anchor. */
export const API_TABLES: [ApiGroup, ApiRow[]][] = [
  ["options", OPTIONS],
  ["theme", THEME],
  ["methods", METHODS],
  ["react", REACT],
  ["exports", EXPORTS],
  ["settings", SETTINGS],
  ["entries", ENTRY_POINTS],
];

/** Groups whose table has a "Default" column. */
export const WITH_DEFAULT: ApiGroup[] = ["options", "settings"];
