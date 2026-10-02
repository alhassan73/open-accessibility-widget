import type {
  AccessibilitySettings,
  ColorMode,
  CursorMode,
  ProfileId,
  ProfilePreset,
  SaturationMode,
  TextAlign,
} from "./types";

export const PROFILE_IDS: readonly ProfileId[] = [
  "seizureSafe",
  "visionImpaired",
  "adhdFriendly",
  "cognitiveDisability",
  "keyboardNav",
  "screenReader",
  "olderAdults",
];

export const DEFAULT_SETTINGS: Readonly<AccessibilitySettings> = Object.freeze({
  profiles: [],
  contentScale: 100,
  fontSize: 100,
  lineHeight: 100,
  letterSpacing: 100,
  textAlign: "default",
  readableFont: false,
  highlightTitles: false,
  highlightLinks: false,
  textMagnifier: false,
  colorMode: "default",
  saturationMode: "default",
  textColor: null,
  titleColor: null,
  backgroundColor: null,
  muteSounds: false,
  hideImages: false,
  stopAnimations: false,
  readingGuide: false,
  readingMask: false,
  highlightFocus: false,
  highlightHover: false,
  cursor: "default",
});

export type RangeKey = "contentScale" | "fontSize" | "lineHeight" | "letterSpacing";

/** Allowed range and step for every percentage setting (100 = unchanged). */
export const RANGES: Readonly<Record<RangeKey, { min: number; max: number; step: number }>> = {
  contentScale: { min: 50, max: 200, step: 10 },
  fontSize: { min: 50, max: 200, step: 10 },
  lineHeight: { min: 100, max: 200, step: 10 },
  letterSpacing: { min: 100, max: 200, step: 10 },
};

const ENUMS: Record<string, readonly string[]> = {
  textAlign: ["default", "left", "center", "right", "justify"] satisfies TextAlign[],
  colorMode: ["default", "dark-contrast", "light-contrast", "high-contrast"] satisfies ColorMode[],
  saturationMode: ["default", "monochrome", "low-saturation", "high-saturation"] satisfies SaturationMode[],
  cursor: ["default", "black", "white"] satisfies CursorMode[],
};

const COLOR_KEYS = ["textColor", "titleColor", "backgroundColor"];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** What each profile switches on. Turning a profile off restores these keys. */
export const PROFILE_PRESETS: Readonly<Record<ProfileId, ProfilePreset>> = {
  seizureSafe: { stopAnimations: true, saturationMode: "low-saturation" },
  visionImpaired: { fontSize: 120, readableFont: true, colorMode: "high-contrast" },
  adhdFriendly: { readingMask: true, stopAnimations: true, saturationMode: "low-saturation" },
  cognitiveDisability: { highlightTitles: true, highlightLinks: true, readingGuide: true, readableFont: true },
  keyboardNav: { highlightFocus: true, highlightLinks: true },
  screenReader: { muteSounds: true, highlightFocus: true },
  olderAdults: { fontSize: 120, lineHeight: 130, readableFont: true, cursor: "black" },
};

export const isProfileId = (value: unknown): value is ProfileId =>
  PROFILE_IDS.includes(value as ProfileId);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Validate untrusted input (localStorage, JS callers) into a complete settings object. */
export function sanitizeSettings(input: unknown): AccessibilitySettings {
  const out: AccessibilitySettings = { ...DEFAULT_SETTINGS, profiles: [] };
  if (!input || typeof input !== "object") return out;

  const src = input as Record<string, unknown>;
  const target = out as unknown as Record<string, unknown>;

  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AccessibilitySettings)[]) {
    const value = src[key];
    if (value === undefined) continue;

    if (key === "profiles") {
      if (Array.isArray(value)) {
        out.profiles = value.filter((id, i): id is ProfileId => isProfileId(id) && value.indexOf(id) === i);
      }
    } else if (key in RANGES) {
      if (typeof value === "number" && Number.isFinite(value)) {
        const { min, max } = RANGES[key as RangeKey];
        target[key] = clamp(Math.round(value), min, max);
      }
    } else if (key in ENUMS) {
      if (ENUMS[key].includes(value as string)) target[key] = value;
    } else if (COLOR_KEYS.includes(key)) {
      if (value === null) target[key] = null;
      else if (typeof value === "string" && HEX_COLOR.test(value)) target[key] = value.toLowerCase();
    } else if (typeof DEFAULT_SETTINGS[key] === "boolean" && typeof value === "boolean") {
      target[key] = value;
    }
  }
  return out;
}

/** Turn a profile on (apply its preset) or off (restore its keys). */
export function toggleProfileSettings(prev: AccessibilitySettings, id: ProfileId): AccessibilitySettings {
  const wasActive = prev.profiles.includes(id);
  const profiles = wasActive ? prev.profiles.filter((p) => p !== id) : [...prev.profiles, id];
  const next = { ...prev, profiles } as Record<string, unknown>;
  const preset = PROFILE_PRESETS[id];

  if (!wasActive) return { ...next, ...preset } as unknown as AccessibilitySettings;

  // Fall back to the value of another still-active profile, else the default.
  for (const key of Object.keys(preset) as (keyof ProfilePreset)[]) {
    const owner = [...profiles].reverse().find((p) => key in PROFILE_PRESETS[p]);
    next[key] = owner ? PROFILE_PRESETS[owner][key] : DEFAULT_SETTINGS[key];
  }
  return next as unknown as AccessibilitySettings;
}

export const isDefaultSettings = (settings: AccessibilitySettings) =>
  JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS);
