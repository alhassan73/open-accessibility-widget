export {
  createAccessibilityWidget,
  createAccessibilityWidget as init,
  getAccessibilityWidget,
  onActiveWidgetChange,
} from "./widget";
export { DEFAULT_SETTINGS, PROFILE_IDS, PROFILE_PRESETS, RANGES, sanitizeSettings } from "./settings";
export { arabicLabels, builtInLanguages, defaultLabels } from "./labels";
export type { AccessibilityLabels, AccessibilityLanguage } from "./labels";
export type {
  AccessibilitySettings,
  AccessibilityState,
  AccessibilityTheme,
  AccessibilityWidgetInstance,
  AccessibilityWidgetOptions,
  ColorMode,
  CursorMode,
  FeatureKey,
  LogoSource,
  ProfileId,
  ProfilePreset,
  SaturationMode,
  SettingKey,
  SettingsUpdate,
  TextAlign,
} from "./types";
