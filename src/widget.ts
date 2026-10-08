import { removeStyles } from "./engine/css";
import { createEngine } from "./engine/engine";
import { builtInLanguages, defaultLabels, type AccessibilityLanguage } from "./labels";
import { DEFAULT_SETTINGS, isDefaultSettings, mergeSettings, sanitizeSettings, toggleProfileSettings } from "./settings";
import type {
  AccessibilitySettings,
  AccessibilityState,
  AccessibilityTheme,
  AccessibilityWidgetInstance,
  AccessibilityWidgetOptions,
  SettingKey,
  SettingsUpdate,
} from "./types";
import { createUI, widgetZIndex, type UiApi, type UiLocale } from "./widget/ui";

// Page adjustments are global, so only one widget may exist at a time. The registry
// lives on globalThis so duplicate copies of the package (ESM + CJS) still share it.
interface Registry {
  instance: AccessibilityWidgetInstance | null;
  listeners: Set<() => void>;
}
const REGISTRY_KEY = Symbol.for("a11yw.registry");
const globalStore = globalThis as unknown as Record<symbol, Registry | undefined>;
const registry: Registry = (globalStore[REGISTRY_KEY] ??= { instance: null, listeners: new Set() });

/** Bumped when the saved format changes, so old data can be migrated. */
const STORAGE_VERSION = 1;
/** Languages written right-to-left, for custom languages that don't set `dir`. */
const RTL_LANGUAGES = /^(ar|arc|ckb|dv|fa|he|iw|ks|ku|ps|sd|syr|ug|ur|yi)(-|$)/i;

const setActive = (instance: AccessibilityWidgetInstance | null) => {
  registry.instance = instance;
  registry.listeners.forEach((listener) => listener());
};

/** Run a consumer callback; an exception in it must never break the widget. */
const safely = (fn: () => void) => {
  try {
    fn();
  } catch (err) {
    console.error("[open-accessibility-widget] A callback threw:", err);
  }
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
    const code = active?.code ?? "en";
    return {
      labels: { ...defaultLabels, ...active?.labels, ...opts.labels },
      dir: opts.dir ?? active?.dir ?? (RTL_LANGUAGES.test(code) ? "rtl" : "ltr"),
      languages: list,
      language: active?.code,
    };
  };

  /** Controls removed with `features: { key: false }` stay at their default. */
  const restrict = (settings: AccessibilitySettings): AccessibilitySettings => {
    const off = Object.entries(opts.features ?? {})
      .filter(([key, on]) => on === false && key in DEFAULT_SETTINGS && key !== "profiles")
      .map(([key]) => key as SettingKey);
    if (!off.length) return settings;
    return sanitizeSettings({ ...settings, ...Object.fromEntries(off.map((key) => [key, DEFAULT_SETTINGS[key]])) });
  };

  const freezeState = (next: AccessibilityState): AccessibilityState => {
    Object.freeze(next.settings.profiles);
    return Object.freeze({ ...next, settings: Object.freeze(next.settings) });
  };

  const saved = persist() ? loadSettings(storageKey()) : null;
  let state = freezeState({
    settings: restrict(saved ?? mergeSettings(sanitizeSettings(null), opts.initialSettings ?? {})),
    isOpen: false,
  });
  let destroyed = false;
  const listeners = new Set<(state: AccessibilityState) => void>();
  const engine = createEngine(document, { nonce: opts.nonce, zIndex: widgetZIndex(opts) });

  const commit = (next: AccessibilityState, save = true) => {
    if (destroyed) return;
    const prev = state;
    state = freezeState(next);
    const settingsChanged = state.settings !== prev.settings;
    if (settingsChanged) {
      engine.apply(state.settings);
      if (save && persist()) saveSettings(storageKey(), state.settings);
    }
    ui.update(state, prev);
    // Consumer code runs last, so the widget is always consistent even if it throws.
    listeners.forEach((listener) => safely(() => listener(state)));
    if (settingsChanged) safely(() => opts.onChange?.(state.settings));
  };

  const commitSettings = (settings: AccessibilitySettings, save = true) => {
    const next = restrict(settings);
    if (JSON.stringify(next) !== JSON.stringify(state.settings)) commit({ ...state, settings: next }, save);
  };

  const api: UiApi = {
    getState: () => state,
    setSettings(update: SettingsUpdate) {
      const patch = typeof update === "function" ? update(state.settings) : update;
      commitSettings(mergeSettings(state.settings, patch ?? {}));
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
    const hadFocus = ui.hasFocus();
    ui.destroy();
    ui = createUI(opts, api, locale());
    ui.update(state);
    if (hadFocus) ui.restoreFocus();
  };
  engine.apply(state.settings);
  ui.update(state);

  // Keep working when the page swaps <body> or its content (Turbo, htmx boost, Astro view transitions).
  let body = document.body;
  const onPageSwap = () => {
    if (!document.body) return; // mid-swap; the new <body> triggers another call
    if (document.body !== body) {
      body = document.body;
      domObserver.observe(body, { childList: true });
    } else if (ui.isConnected()) return;
    engine.refresh();
    rebuildUI();
  };
  const domObserver = new MutationObserver(onPageSwap);
  domObserver.observe(document.documentElement, { childList: true });
  domObserver.observe(body, { childList: true });

  // Settings changed in another tab of the same site.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== storageKey() || !persist()) return;
    commitSettings(e.newValue ? parseSettings(e.newValue) : sanitizeSettings(null), false);
  };
  window.addEventListener("storage", onStorage);

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
      engine.setZIndex(widgetZIndex(opts));
      rebuildUI();
      commitSettings(state.settings); // newly removed features switch off
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      domObserver.disconnect();
      window.removeEventListener("storage", onStorage);
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

/** Saved JSON → settings. Unknown versions and corrupt data fall back to defaults. */
function parseSettings(raw: string): AccessibilitySettings {
  try {
    const data = JSON.parse(raw) as { v?: unknown } | null;
    // Version 1 is the first versioned format; unversioned data (1.0.x) has the same shape.
    if (data && typeof data === "object" && data.v !== undefined && data.v !== STORAGE_VERSION) return sanitizeSettings(null);
    return sanitizeSettings(data);
  } catch {
    return sanitizeSettings(null);
  }
}

/** Saved settings, or `null` when nothing is saved (or storage is blocked). */
function loadSettings(key: string): AccessibilitySettings | null {
  const raw = readStorage(key);
  return raw ? parseSettings(raw) : null;
}

function saveSettings(key: string, settings: AccessibilitySettings) {
  try {
    if (isDefaultSettings(settings)) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify({ v: STORAGE_VERSION, ...settings }));
  } catch {
    // Storage unavailable (private mode, quota, blocked) — settings still work for this page view.
  }
}

/** The widget must itself be accessible: warn when brand colors make parts of it unreadable. */
function warnOnLowContrast(theme: AccessibilityTheme | undefined) {
  if (!theme) return;
  const primary = theme.primary ?? "#0f766e";
  const background = theme.background ?? "#ffffff";
  const checks: [string, string, string, number][] = [
    [theme.onPrimary ?? "#ffffff", primary, "header, buttons and icons on the brand color", 4.5],
    [primary, background, "focus outlines and selected options", 3],
    [primary, theme.surface ?? "#f4f6f8", "footer links", 4.5],
    [theme.text ?? "#0f172a", background, "panel text", 4.5],
    [theme.mutedText ?? "#475569", background, "descriptions and section titles", 4.5],
  ];
  for (const [color, against, use, need] of checks) {
    const ratio = contrast(color, against);
    if (ratio !== null && ratio < need) {
      console.warn(
        `[open-accessibility-widget] theme contrast ${ratio.toFixed(2)}:1 is too low for ${use} ` +
          `(${color} on ${against}); WCAG needs at least ${need}:1.`
      );
    }
  }
}

function contrast(a: string, b: string): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
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
