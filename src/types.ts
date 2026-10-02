import type { AccessibilityLabels, AccessibilityLanguage } from "./labels";

export type ProfileId =
  | "seizureSafe"
  | "visionImpaired"
  | "adhdFriendly"
  | "cognitiveDisability"
  | "keyboardNav"
  | "screenReader"
  | "olderAdults";

export type ColorMode = "default" | "dark-contrast" | "light-contrast" | "high-contrast";
export type SaturationMode = "default" | "monochrome" | "low-saturation" | "high-saturation";
export type TextAlign = "default" | "left" | "center" | "right" | "justify";
export type CursorMode = "default" | "black" | "white";

export interface AccessibilitySettings {
  /** Active profiles, in activation order. */
  profiles: ProfileId[];

  // Content — percentages, 100 = unchanged
  contentScale: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: TextAlign;
  readableFont: boolean;
  highlightTitles: boolean;
  highlightLinks: boolean;
  textMagnifier: boolean;

  // Colors — custom colors are `null` when not set
  colorMode: ColorMode;
  saturationMode: SaturationMode;
  textColor: string | null;
  titleColor: string | null;
  backgroundColor: string | null;

  // Navigation
  muteSounds: boolean;
  hideImages: boolean;
  stopAnimations: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  highlightFocus: boolean;
  highlightHover: boolean;
  cursor: CursorMode;
}

export type ProfilePreset = Partial<Omit<AccessibilitySettings, "profiles">>;

export interface AccessibilityState {
  settings: AccessibilitySettings;
  isOpen: boolean;
}

export interface AccessibilityTheme {
  /** Brand color: launcher, header, active states. */
  primary?: string;
  /** Text/icon color drawn on top of `primary`. */
  onPrimary?: string;
  /** Panel background. */
  background?: string;
  /** Tab bar / footer background. */
  surface?: string;
  text?: string;
  mutedText?: string;
  border?: string;
  /** Corner radius, e.g. `12` or `"1rem"`. */
  radius?: number | string;
  fontFamily?: string;
}

/** An image URL (png/svg/data: URI) or a DOM element to clone. */
export type LogoSource = string | Element;

export interface AccessibilityWidgetOptions {
  /** Screen side of the launcher and panel. Default `"left"`. */
  position?: "left" | "right";
  /** Distance from the screen edges in px. Default `{ x: 24, y: 24 }`. */
  offset?: { x?: number; y?: number };
  /** Widget colors and shape. */
  theme?: AccessibilityTheme;
  /** Launcher logo. Defaults to the built-in accessibility icon. */
  icon?: LogoSource;
  /** Logo shown next to the panel title. Hidden by default. */
  logo?: LogoSource | null;
  /** Launcher diameter in px. Default `56`. */
  buttonSize?: number;
  /** Languages offered in the header menu, or `false` to hide the menu. Default: English + Arabic. */
  languages?: AccessibilityLanguage[] | false;
  /** Initial language code. Default: the visitor's last choice, else `<html lang>`, else the first language. */
  language?: string;
  /** Override individual UI strings on top of the active language. */
  labels?: Partial<AccessibilityLabels>;
  /** Force the widget's text direction. Default: the active language's direction. */
  dir?: "ltr" | "rtl";
  /** Keyboard shortcut that toggles the menu, or `false`. Default `"Alt+A"`. */
  shortcut?: string | false;
  /** Link to your accessibility statement, shown in the footer. */
  statementUrl?: string;
  /** Render a "Skip to main content" link. Default `true`. */
  showSkipLink?: boolean;
  /** Stacking order. Default `2147483000`. */
  zIndex?: number;
  /** Save settings in localStorage so they survive reloads. Default `true`. */
  persist?: boolean;
  /** localStorage key. Default `"a11yw-settings"`. */
  storageKey?: string;
  /** CSP nonce for the injected `<style>` tag. */
  nonce?: string;
  /** Called whenever the user changes a setting. */
  onChange?: (settings: AccessibilitySettings) => void;
}

export type SettingsUpdate =
  | Partial<AccessibilitySettings>
  | ((prev: AccessibilitySettings) => Partial<AccessibilitySettings>);

export interface AccessibilityWidgetInstance {
  getState(): AccessibilityState;
  getSettings(): AccessibilitySettings;
  /** Merge changes into the settings. Input is validated; invalid values are dropped. */
  setSettings(update: SettingsUpdate): void;
  toggleProfile(id: ProfileId): void;
  reset(): void;
  open(): void;
  close(): void;
  toggle(): void;
  /** Change appearance/behaviour options at runtime. */
  setOptions(options: AccessibilityWidgetOptions): void;
  /** Listen to settings / open-state changes. Returns an unsubscribe function. */
  subscribe(listener: (state: AccessibilityState) => void): () => void;
  /** Remove the widget and undo every page adjustment. */
  destroy(): void;
}
