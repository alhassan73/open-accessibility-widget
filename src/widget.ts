import { removeStyles } from "./engine/css";
import { createEngine } from "./engine/engine";
import { builtInLanguages, defaultLabels, type AccessibilityLanguage } from "./labels";
import { isDefaultSettings, sanitizeSettings, toggleProfileSettings } from "./settings";
import type {
  AccessibilitySettings,
  AccessibilityState,
  AccessibilityTheme,
  AccessibilityWidgetInstance,
  AccessibilityWidgetOptions,
  SettingsUpdate,
} from "./types";
import { createUI, type UiApi, type UiLocale } from "./widget/ui";

// Page adjustments are global, so only one widget may exist at a time. The registry
// lives on globalThis so duplicate copies of the package (ESM + CJS) still share it.
interface Registry {
  instance: AccessibilityWidgetInstance | null;
  listeners: Set<() => void>;
}
const REGISTRY_KEY = Symbol.for("a11yw.registry");
const globalStore = globalThis as unknown as Record<symbol, Registry | undefined>;
const registry: Registry = (globalStore[REGISTRY_KEY] ??= { instance: null, listeners: new Set() });

const setActive = (instance: AccessibilityWidgetInstance | null) => {
  registry.instance = instance;
  registry.listeners.forEach((listener) => listener());
};

/** The widget currently on the page, if any. */
export const getAccessibilityWidget = (): AccessibilityWidgetInstance | null => registry.instance;

/** Notified when a widget is created or destroyed. Returns an unsubscribe function. */
export function onActiveWidgetChange(listener: () => void): () => void {
  registry.listeners.add(listener);
  return () => registry.listeners.delete(listener);
}

/**
 * Mount the accessibility widget and start applying the user's saved settings.
 * Creating a second widget replaces the first.
 */
export function createAccessibilityWidget(
  options: AccessibilityWidgetOptions = {}
): AccessibilityWidgetInstance {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error(
      "[open-accessibility-widget] createAccessibilityWidget() needs a browser. " +
        "Call it after the page has mounted (useEffect, onMounted, ngAfterViewInit, DOMContentLoaded…)."
    );
  }
  registry.instance?.destroy();

  let opts = options;
  const storageKey = () => opts.storageKey ?? "a11yw-settings";
  const persist = () => opts.persist !== false;
  warnOnLowContrast(opts.theme);

  const languages = () => (opts.languages === false ? [] : opts.languages ?? builtInLanguages);
  const languageKey = () => `${storageKey()}:lang`;
  let language =
    opts.language ?? (persist() ? readStorage(languageKey()) : null) ?? matchPageLanguage(languages());
  const locale = (): UiLocale => {
    const list = languages();
    const active = list.find((l) => l.code === language) ?? list[0];
    return {
      labels: { ...defaultLabels, ...active?.labels, ...opts.labels },
      dir: opts.dir ?? active?.dir,
      languages: list,
      language: active?.code,
    };
  };

  let state: AccessibilityState = {
    settings: persist() ? loadSettings(storageKey()) : sanitizeSettings(null),
    isOpen: false,
  };
  let destroyed = false;
  const listeners = new Set<(state: AccessibilityState) => void>();
  const engine = createEngine(document, opts.nonce);

  const commit = (next: AccessibilityState) => {
    if (destroyed) return;
    const prev = state;
    state = next;
    if (next.settings !== prev.settings) {
      engine.apply(next.settings);
      if (persist()) saveSettings(storageKey(), next.settings);
      opts.onChange?.(next.settings);
    }
    ui.update(next, prev);
    listeners.forEach((listener) => listener(next));
  };

  const commitSettings = (settings: AccessibilitySettings) => {
    if (JSON.stringify(settings) !== JSON.stringify(state.settings)) commit({ ...state, settings });
  };

  const api: UiApi = {
    getState: () => state,
    setSettings(update: SettingsUpdate) {
      const patch = typeof update === "function" ? update(state.settings) : update;
      commitSettings(sanitizeSettings({ ...state.settings, ...patch }));
    },
    toggleProfile: (id) => commitSettings(toggleProfileSettings(state.settings, id)),
    reset: () => commitSettings(sanitizeSettings(null)),
    setOpen: (isOpen) => {
      if (isOpen !== state.isOpen) commit({ ...state, isOpen });
    },
    setLanguage(code) {
      if (!languages().some((l) => l.code === code)) return;
      language = code;
      if (persist()) writeStorage(languageKey(), code);
      rebuildUI();
      ui.focusLanguage();
    },
  };

  let ui = createUI(opts, api, locale());
  const rebuildUI = () => {
    ui.destroy();
    ui = createUI(opts, api, locale());
    ui.update(state);
  };
  engine.apply(state.settings);
  ui.update(state);

  const instance: AccessibilityWidgetInstance = {
    getState: () => state,
    getSettings: () => state.settings,
    setSettings: api.setSettings,
    toggleProfile: api.toggleProfile,
    reset: api.reset,
    open: () => api.setOpen(true),
    close: () => api.setOpen(false),
    toggle: () => api.setOpen(!state.isOpen),
    setOptions(next) {
      if (destroyed) return;
      opts = { ...opts, ...next };
      if (next.language) language = next.language;
      warnOnLowContrast(opts.theme);
      rebuildUI();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ui.destroy();
      engine.destroy();
      removeStyles(document);
      listeners.clear();
      if (registry.instance === instance) setActive(null);
    },
  };

  setActive(instance);
  return instance;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable — the choice still applies to this page view.
  }
}

/** Pick the language matching <html lang> (e.g. "ar-EG" → "ar"), else the first one. */
function matchPageLanguage(languages: AccessibilityLanguage[]): string | undefined {
  const page = document.documentElement.lang.toLowerCase();
  const match = languages.find((l) => {
    const code = l.code.toLowerCase();
    return page === code || page.startsWith(`${code}-`);
  });
  return (match ?? languages[0])?.code;
}

function loadSettings(key: string): AccessibilitySettings {
  try {
    const raw = window.localStorage.getItem(key);
    return sanitizeSettings(raw ? JSON.parse(raw) : null);
  } catch {
    return sanitizeSettings(null); // storage blocked or corrupted JSON
  }
}

function saveSettings(key: string, settings: AccessibilitySettings) {
  try {
    if (isDefaultSettings(settings)) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode, quota, blocked) — settings still work for this page view.
  }
}

/** The widget must itself be accessible: warn when brand colors make the header unreadable. */
function warnOnLowContrast(theme: AccessibilityTheme | undefined) {
  if (!theme?.primary && !theme?.onPrimary) return;
  const a = luminance(theme.primary ?? "#0f766e");
  const b = luminance(theme.onPrimary ?? "#ffffff");
  if (a === null || b === null) return;
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  if (ratio < 4.5) {
    console.warn(
      `[open-accessibility-widget] theme.primary and theme.onPrimary have a contrast ratio of ${ratio.toFixed(2)}:1. ` +
        "WCAG requires at least 4.5:1 for the header text and icons."
    );
  }
}

function luminance(color: string): number | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null; // named / rgb() colors are not checked
  const hex = match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
