import type { AccessibilityLabels, AccessibilityLanguage } from "../labels";
import { DEFAULT_SETTINGS, isDefaultSettings, PROFILE_IDS, PROFILE_PRESETS, RANGES, type RangeKey } from "../settings";
import type {
  AccessibilitySettings,
  AccessibilityState,
  AccessibilityWidgetOptions,
  FeatureKey,
  ProfileId,
  SettingKey,
  SettingsUpdate,
} from "../types";
import { FOCUSABLE, h, logoNode, num, trapTab, uid } from "./dom";
import { icon, type IconName } from "./icons";

export interface UiApi {
  getState(): AccessibilityState;
  setSettings(update: SettingsUpdate): void;
  toggleProfile(id: ProfileId): void;
  reset(): void;
  setOpen(open: boolean): void;
  setLanguage(code: string): void;
}

export interface UiLocale {
  labels: AccessibilityLabels;
  dir?: "ltr" | "rtl";
  languages: AccessibilityLanguage[];
  language?: string;
}

export interface Ui {
  update(state: AccessibilityState, prev?: AccessibilityState): void;
  focusLanguage(): void;
  /** Put focus back after a rebuild: the close button when open, else the launcher. */
  restoreFocus(): void;
  hasFocus(): boolean;
  isConnected(): boolean;
  destroy(): void;
}

type S = AccessibilitySettings;
type BooleanKey = { [K in keyof S]: S[K] extends boolean ? K : never }[keyof S];
type ColorKey = "textColor" | "titleColor" | "backgroundColor";

const IGNORE = ".a11yw-ignore";
const DEFAULT_Z = 2147483000;
const PROFILE_ICONS: Record<ProfileId, IconName> = {
  seizureSafe: "zap",
  visionImpaired: "eye",
  adhdFriendly: "target",
  cognitiveDisability: "bulb",
  keyboardNav: "keyboard",
  screenReader: "ear",
  olderAdults: "glasses",
};

/** Sections open on first render; remembered while the page stays open. */
const openSections = new Set<string>(["text"]);

/** "Increase {label}" style templates; plain strings get the name appended. */
const withLabel = (text: string, label: string) =>
  text.includes("{label}") ? text.replace("{label}", label) : `${text} ${label}`;

export const widgetZIndex = (opts: AccessibilityWidgetOptions) =>
  Math.round(num(opts.zIndex, 1, 2147483647, DEFAULT_Z));

export function createUI(opts: AccessibilityWidgetOptions, api: UiApi, locale: UiLocale): Ui {
  const L = locale.labels;
  const syncs: ((s: S) => void)[] = [];
  const sync = (fn: (s: S) => void) => syncs.push(fn);
  const set = api.setSettings;
  const side = opts.position === "right" ? "right" : "left";
  const theme = opts.theme ?? {};
  const shortcut = opts.shortcut === false ? null : parseShortcut(opts.shortcut ?? "Alt+A");
  const enabled = (key: FeatureKey) => opts.features?.[key] !== false;
  const percent = percentFormatter(locale.language);

  // ── Controls ───────────────────────────────────────────────────────

  /** A settings row that turns something on/off. */
  const switchRow = (label: string, iconName: IconName, isOn: (s: S) => boolean, onClick: () => void) => {
    const btn = h(
      "button",
      { type: "button", role: "switch", className: "a11yw-row", onClick },
      icon(iconName),
      h("span", { className: "a11yw-row-label" }, label),
      h("span", { className: "a11yw-switch", "aria-hidden": "true" })
    );
    sync((s) => btn.setAttribute("aria-checked", String(isOn(s))));
    return btn;
  };

  const toggleRow = (key: BooleanKey, label: string, iconName: IconName) =>
    enabled(key)
      ? switchRow(label, iconName, (s) => s[key], () => set((s) => ({ [key]: !s[key] }) as Partial<S>))
      : null;

  /** − value + stepper for percentage settings. The new value is announced with its name. */
  const stepperRow = (key: RangeKey, label: string, iconName: IconName) => {
    if (!enabled(key)) return null;
    const { min, max, step } = RANGES[key];
    const labelId = uid();
    const valueId = uid();
    const setValue = (next: (v: number) => number) => {
      const before = api.getState().settings[key];
      set((s) => ({ [key]: Math.min(max, Math.max(min, next(s[key]))) }));
      const after = api.getState().settings[key];
      if (after !== before) announce(`${label} ${percent(after)}`);
    };
    const value = h("span", { id: valueId, className: "a11yw-step-value" });
    const stepBtn = (name: "minus" | "plus", text: string, delta: number) =>
      h(
        "button",
        {
          type: "button",
          className: "a11yw-step-btn",
          "aria-label": withLabel(text, label),
          "aria-describedby": valueId,
          onClick: () => setValue((v) => v + delta),
        },
        icon(name)
      );
    const dec = stepBtn("minus", L.decrease, -step);
    const inc = stepBtn("plus", L.increase, step);
    const reset = h(
      "button",
      {
        type: "button",
        className: "a11yw-mini-btn",
        "aria-label": withLabel(L.reset, label),
        "aria-describedby": valueId,
        onClick: () => setValue(() => 100),
      },
      icon("reset")
    );
    // aria-disabled (not `disabled`) keeps focus on the button when a limit is reached.
    sync((s) => {
      const v = s[key];
      value.textContent = percent(v);
      dec.setAttribute("aria-disabled", String(v <= min));
      inc.setAttribute("aria-disabled", String(v >= max));
      reset.setAttribute("aria-disabled", String(v === 100));
    });
    return h(
      "div",
      { className: "a11yw-row", role: "group", "aria-labelledby": labelId },
      icon(iconName),
      h("span", { id: labelId, className: "a11yw-row-label" }, label),
      h("span", { className: "a11yw-step" }, dec, value, inc, reset)
    );
  };

  /** Single choice from a few options (WAI-ARIA radio group with arrow-key support). */
  const choiceField = <K extends SettingKey>(
    key: K,
    label: string,
    iconName: IconName,
    choices: [S[K], string][]
  ) => {
    if (!enabled(key)) return null;
    const labelId = uid();
    const radios = choices.map(([value, text]) => {
      const radio = h("button", { type: "button", role: "radio", onClick: () => set({ [key]: value } as Partial<S>) }, text);
      sync((s) => {
        const checked = s[key] === value;
        radio.setAttribute("aria-checked", String(checked));
        radio.tabIndex = checked ? 0 : -1;
      });
      return radio;
    });
    const group = h("div", { className: "a11yw-seg", role: "radiogroup", "aria-labelledby": labelId }, ...radios);
    group.addEventListener("keydown", (e) => {
      const index = radios.indexOf(document.activeElement as HTMLButtonElement);
      if (index < 0) return;
      const rtl = getComputedStyle(group).direction === "rtl";
      const next = { ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 }[e.key];
      const target =
        next !== undefined ? (index + next + radios.length) % radios.length
        : e.key === "Home" ? 0
        : e.key === "End" ? radios.length - 1
        : -1;
      if (target < 0) return;
      e.preventDefault();
      radios[target].click();
      radios[target].focus();
    });
    return h(
      "div",
      { className: "a11yw-field" },
      h("span", { id: labelId, className: "a11yw-field-label" }, icon(iconName), label),
      group
    );
  };

  const colorRow = (key: ColorKey, label: string, fallback: string) => {
    if (!enabled(key)) return null;
    const id = uid();
    const input = h("input", { id, type: "color", onInput: () => set({ [key]: input.value }) });
    const reset = h(
      "button",
      { type: "button", className: "a11yw-mini-btn", "aria-label": withLabel(L.reset, label), onClick: () => set({ [key]: null }) },
      icon("reset")
    );
    sync((s) => {
      input.value = s[key] ?? fallback;
      reset.setAttribute("aria-disabled", String(s[key] === null));
    });
    return h(
      "div",
      { className: "a11yw-row" },
      icon("palette"),
      h("label", { for: id, className: "a11yw-row-label" }, label),
      input,
      reset
    );
  };

  /** Collapsible section (WAI-ARIA accordion) with a count of active adjustments. Empty sections are left out. */
  const section = (id: string, title: string, iconName: IconName, keys: SettingKey[], ...rows: (Node | null)[]) => {
    const children = rows.filter((row): row is Node => row !== null);
    if (!children.length) return null;
    const buttonId = uid();
    const regionId = uid();
    const count = h("span", { className: "a11yw-count" });
    const button = h(
      "button",
      { type: "button", id: buttonId, className: "a11yw-acc-btn", "aria-controls": regionId },
      icon(iconName),
      h("span", { className: "a11yw-acc-title" }, title),
      count,
      icon("chevron", "a11yw-chev")
    );
    const region = h("div", { id: regionId, role: "region", "aria-labelledby": buttonId, className: "a11yw-acc-panel" }, ...children);
    const render = () => {
      const open = openSections.has(id);
      button.setAttribute("aria-expanded", String(open));
      region.hidden = !open;
    };
    button.addEventListener("click", () => {
      if (openSections.has(id)) openSections.delete(id);
      else openSections.add(id);
      render();
    });
    render();
    sync((s) => {
      const n = keys.filter((k) => s[k] !== DEFAULT_SETTINGS[k]).length;
      count.textContent = n ? L.activeCount.replace("{n}", String(n)) : "";
      count.hidden = n === 0;
    });
    return h("div", { className: "a11yw-section" }, h("h3", { className: "a11yw-acc-heading" }, button), region);
  };

  const profileCard = (id: ProfileId) => {
    // A profile is offered only while at least one of its adjustments is available.
    if (!Object.keys(PROFILE_PRESETS[id]).some((key) => enabled(key as SettingKey))) return null;
    const labelId = uid();
    const descId = uid();
    const btn = h(
      "button",
      {
        type: "button",
        className: "a11yw-profile",
        "aria-labelledby": labelId,
        "aria-describedby": descId,
        onClick: () => api.toggleProfile(id),
      },
      icon(PROFILE_ICONS[id]),
      h(
        "span",
        {},
        h("span", { id: labelId, className: "a11yw-profile-label" }, L[id]),
        h("span", { id: descId, className: "a11yw-profile-desc" }, L[`${id}Desc`])
      ),
      h("span", { className: "a11yw-check", "aria-hidden": "true" }, icon("check"))
    );
    sync((s) => btn.setAttribute("aria-pressed", String(s.profiles.includes(id))));
    return btn;
  };

  // ── Panel body ─────────────────────────────────────────────────────
  const profilesTitleId = uid();
  const profileCards = enabled("profiles") ? PROFILE_IDS.map(profileCard).filter((c): c is HTMLButtonElement => c !== null) : [];
  const body = h(
    "div",
    { className: "a11yw-body" },
    profileCards.length > 0 &&
      h(
        "div",
        { role: "group", "aria-labelledby": profilesTitleId },
        // aria-label keeps the name in normal case (CSS uppercases it visually).
        h("h3", { id: profilesTitleId, className: "a11yw-block-title", "aria-label": L.profilesTitle }, L.profilesTitle),
        h("div", { className: "a11yw-profiles" }, ...profileCards)
      ),
    section(
      "text",
      L.textSection,
      "font",
      ["contentScale", "fontSize", "lineHeight", "letterSpacing", "textAlign", "readableFont"],
      stepperRow("fontSize", L.fontSize, "fontSize"),
      stepperRow("contentScale", L.contentScale, "scale"),
      stepperRow("lineHeight", L.lineHeight, "lineHeight"),
      stepperRow("letterSpacing", L.letterSpacing, "letterSpacing"),
      // No "justify": uneven word gaps make text harder to read (WCAG 1.4.8 guidance).
      choiceField("textAlign", L.textAlign, "align", [
        ["default", L.alignDefault],
        ["left", L.alignLeft],
        ["center", L.alignCenter],
        ["right", L.alignRight],
      ]),
      toggleRow("readableFont", L.readableFont, "font")
    ),
    section(
      "color",
      L.colorSection,
      "palette",
      ["colorMode", "saturationMode", "textColor", "titleColor", "backgroundColor"],
      choiceField("colorMode", L.contrast, "contrast", [
        ["default", L.contrastOff],
        ["dark-contrast", L.darkContrast],
        ["light-contrast", L.lightContrast],
        ["high-contrast", L.highContrast],
      ]),
      choiceField("saturationMode", L.saturation, "drop", [
        ["default", L.saturationOff],
        ["monochrome", L.monochrome],
        ["low-saturation", L.lowSaturation],
        ["high-saturation", L.highSaturation],
      ]),
      colorRow("textColor", L.textColor, "#000000"),
      colorRow("titleColor", L.titleColor, "#000000"),
      colorRow("backgroundColor", L.backgroundColor, "#ffffff")
    ),
    section(
      "reading",
      L.readingSection,
      "book",
      ["highlightTitles", "highlightLinks", "textMagnifier", "readingGuide", "readingMask"],
      toggleRow("highlightTitles", L.highlightTitles, "heading"),
      toggleRow("highlightLinks", L.highlightLinks, "link"),
      toggleRow("textMagnifier", L.textMagnifier, "magnifier"),
      toggleRow("readingGuide", L.readingGuide, "guide"),
      toggleRow("readingMask", L.readingMask, "mask"),
      enabled("readMode")
        ? h(
            "button",
            { type: "button", className: "a11yw-row", "aria-haspopup": "dialog", onClick: () => openReader() },
            icon("book"),
            h("span", { className: "a11yw-row-label" }, L.readMode),
            icon("arrow", "a11yw-flip")
          )
        : null
    ),
    section(
      "motion",
      L.motionSection,
      "compass",
      ["stopAnimations", "muteSounds", "hideImages", "highlightFocus", "highlightHover", "cursor"],
      toggleRow("stopAnimations", L.stopAnimations, "pause"),
      toggleRow("muteSounds", L.muteSounds, "mute"),
      toggleRow("hideImages", L.hideImages, "imageOff"),
      toggleRow("highlightFocus", L.highlightFocus, "focus"),
      toggleRow("highlightHover", L.highlightHover, "pointer"),
      choiceField("cursor", L.cursor, "pointer", [
        ["default", L.cursorDefault],
        ["black", L.cursorBlack],
        ["white", L.cursorWhite],
      ])
    )
  );

  // ── Header & footer ────────────────────────────────────────────────
  const live = h("div", { className: "a11yw-sr-only", role: "status" });
  const announce = (message: string) => {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = message));
  };

  const closeBtn = h(
    "button",
    { type: "button", className: "a11yw-icon-btn", "aria-label": L.close, onClick: () => api.setOpen(false) },
    icon("close")
  );

  let langSelect: HTMLSelectElement | null = null;
  if (locale.languages.length > 1) {
    const select = h(
      "select",
      { className: "a11yw-lang", "aria-label": L.language },
      ...locale.languages.map((lang) =>
        h("option", { value: lang.code, lang: lang.code, selected: lang.code === locale.language }, lang.name)
      )
    );
    select.addEventListener("change", () => api.setLanguage(select.value));
    langSelect = select;
  }

  const hideWidget = () => {
    launcher.hidden = true;
    api.setOpen(false);
    focusMainContent();
    announce(L.widgetHidden.replace("{shortcut}", shortcut?.aria ?? ""));
  };

  const statementUrl = safeUrl(opts.statementUrl);
  const panelId = uid();
  const titleId = uid();
  // Hiding is offered only when the visitor can bring the widget back: a shortcut and a keyboard.
  const canHide = !!shortcut && typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;

  const panel = h(
    "div",
    {
      id: panelId,
      className: "a11yw-panel",
      "data-side": side,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      hidden: true,
    },
    h(
      "div",
      { className: "a11yw-header" },
      h("span", { className: "a11yw-badge", "aria-hidden": "true" }, opts.logo ? logoNode(opts.logo) : icon("accessibility")),
      h("h2", { id: titleId, className: "a11yw-title" }, L.title),
      langSelect && h("span", { className: "a11yw-lang-wrap" }, icon("globe"), langSelect),
      closeBtn
    ),
    body,
    h(
      "div",
      { className: "a11yw-footer" },
      h(
        "button",
        {
          type: "button",
          className: "a11yw-btn",
          onClick: () => {
            api.reset();
            announce(L.resetDone);
          },
        },
        icon("reset"),
        L.resetAll
      ),
      h("span", { className: "a11yw-spacer" }),
      statementUrl && h("a", { className: "a11yw-link", href: statementUrl }, L.statement),
      canHide && h("button", { type: "button", className: "a11yw-link", onClick: hideWidget }, L.hideWidget)
    )
  );

  // "Adjustments are on" for screen readers, matching the dot on the launcher.
  const activeNoteId = uid();
  const activeNote = h("span", { id: activeNoteId, className: "a11yw-sr-only" });

  const launcher = h(
    "button",
    {
      type: "button",
      className: "a11yw-launcher",
      "data-side": side,
      "aria-label": L.launcher,
      "aria-describedby": activeNoteId,
      "aria-haspopup": "dialog",
      "aria-expanded": "false",
      "aria-controls": panelId,
      "aria-keyshortcuts": shortcut ? shortcut.aria : null,
      onClick: () => api.setOpen(!api.getState().isOpen),
    },
    opts.icon ? logoNode(opts.icon) : icon("accessibility")
  );

  const skipLink =
    opts.showSkipLink !== false &&
    findMainContent() !== null &&
    !pageHasSkipLink() &&
    h(
      "a",
      {
        className: "a11yw-skip",
        href: "#",
        onClick: (e: Event) => {
          e.preventDefault();
          focusMainContent();
        },
      },
      L.skipToContent
    );

  const offset = opts.offset ?? {};
  const widget = h(
    "div",
    {
      className: "a11yw-widget",
      dir: locale.dir,
      lang: locale.language,
      style: {
        "--a11yw-x": `${num(offset.x, 0, 1000, 24)}px`,
        "--a11yw-y": `${num(offset.y, 0, 1000, 24)}px`,
        "--a11yw-size": `${num(opts.buttonSize, 24, 160, 56)}px`,
        "--a11yw-z": widgetZIndex(opts),
        "--a11yw-primary": theme.primary,
        "--a11yw-on-primary": theme.onPrimary,
        "--a11yw-bg": theme.background,
        "--a11yw-surface": theme.surface,
        "--a11yw-text": theme.text,
        "--a11yw-muted": theme.mutedText,
        "--a11yw-border": theme.border,
        "--a11yw-radius": typeof theme.radius === "number" ? `${theme.radius}px` : theme.radius,
        "--a11yw-font-family": theme.fontFamily,
      },
    },
    skipLink,
    launcher,
    activeNote,
    panel,
    live
  );

  // Placed first in <body> so the skip link and launcher come early in the tab order.
  // The root is `display: contents`, so it never takes part in the page's own layout.
  const root = h("div", { className: "a11yw-ignore a11yw-root" }, widget);
  document.body.prepend(root);

  // ── Read mode ──────────────────────────────────────────────────────
  let reader: HTMLElement | null = null;
  let bodyOverflow = "";

  const closeReader = () => {
    if (!reader) return;
    reader.remove();
    reader = null;
    document.body.style.overflow = bodyOverflow;
    launcher.focus();
  };

  const openReader = () => {
    api.setOpen(false);
    const readerTitleId = uid();
    const blocks = extractReadableContent(L.image);
    const readerClose = h(
      "button",
      { type: "button", className: "a11yw-icon-btn", "aria-label": L.closeReadMode, onClick: closeReader },
      icon("close")
    );
    const backdrop = h(
      "div",
      { className: "a11yw-reader-backdrop" },
      h(
        "div",
        { className: "a11yw-reader", role: "dialog", "aria-modal": "true", "aria-labelledby": readerTitleId },
        h(
          "div",
          { className: "a11yw-reader-bar" },
          h("h2", { id: readerTitleId, className: "a11yw-title" }, L.readModeTitle),
          readerClose
        ),
        // The page's own language and direction, so it is read with the right voice (WCAG 3.1.2).
        h(
          "div",
          {
            className: "a11yw-reader-body",
            tabindex: "0",
            role: "document",
            "aria-labelledby": readerTitleId,
            lang: document.documentElement.lang,
            dir: getComputedStyle(document.body).direction,
          },
          ...(blocks.length ? blocks : [h("p", { lang: locale.language }, L.noReadableContent)])
        )
      )
    );
    backdrop.addEventListener("click", (e) => e.target === backdrop && closeReader());
    reader = backdrop;
    widget.append(backdrop);
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    readerClose.focus();
  };

  // ── Global listeners ───────────────────────────────────────────────
  const onKeyDown = (e: KeyboardEvent) => {
    if (shortcut && matchesShortcut(e, shortcut)) {
      e.preventDefault();
      if (!reader) api.setOpen(!api.getState().isOpen);
      return;
    }
    const modal = reader ?? (api.getState().isOpen ? panel : null);
    if (!modal) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (reader) closeReader();
      else api.setOpen(false);
      return;
    }
    trapTab(e, modal);
  };

  const onPointerDown = (e: PointerEvent) => {
    const t = e.target as Node;
    if (api.getState().isOpen && !panel.contains(t) && !launcher.contains(t)) api.setOpen(false);
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("pointerdown", onPointerDown);

  // Open/close with a CSS transition; `hidden` is applied only after it finishes.
  let hideTimer = 0;
  const showPanel = (animate: boolean) => {
    window.clearTimeout(hideTimer);
    panel.hidden = false;
    panel.inert = false;
    if (animate) void panel.offsetWidth; // commit the start state so the transition runs
    panel.setAttribute("data-open", "");
  };
  const hidePanel = () => {
    panel.removeAttribute("data-open");
    panel.inert = true; // not focusable or clickable while fading out
    const ms = transitionMs(panel);
    if (ms === 0) panel.hidden = true;
    else hideTimer = window.setTimeout(() => (panel.hidden = true), ms);
  };

  return {
    update(state, prev) {
      const s = state.settings;
      syncs.forEach((fn) => fn(s));
      // Small dot on the launcher (and a description for screen readers) whenever any adjustment is on.
      const active = !isDefaultSettings(s);
      launcher.toggleAttribute("data-active", active);
      activeNote.textContent = active ? L.activeAdjustments : "";
      if (prev && state.isOpen === prev.isOpen) return;

      launcher.setAttribute("aria-expanded", String(state.isOpen));
      if (state.isOpen) {
        // A rebuild (no `prev`) shows the panel in place: no animation, no focus move.
        showPanel(!!prev);
        launcher.hidden = false; // re-shown when reopened after "Hide widget"
        if (prev) closeBtn.focus();
      } else if (prev) {
        // Return focus to the launcher unless the user already moved it elsewhere.
        const active = document.activeElement;
        const returnFocus = !launcher.hidden && (!active || active === document.body || panel.contains(active));
        hidePanel();
        if (returnFocus) launcher.focus();
      }
    },
    focusLanguage() {
      langSelect?.focus();
    },
    restoreFocus() {
      (api.getState().isOpen ? closeBtn : launcher).focus();
    },
    hasFocus: () => root.contains(document.activeElement),
    isConnected: () => root.isConnected,
    destroy() {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.clearTimeout(hideTimer);
      if (reader) document.body.style.overflow = bodyOverflow;
      root.remove();
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

/** "120%" formatted for the widget's language. */
function percentFormatter(language: string | undefined): (value: number) => string {
  try {
    const format = new Intl.NumberFormat(language, { style: "percent", maximumFractionDigits: 0 });
    return (value) => format.format(value / 100);
  } catch {
    return (value) => `${value}%`; // unknown language code
  }
}

/** Longest transition on an element, in ms (0 when motion is reduced or disabled). */
function transitionMs(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const parse = (list: string) => list.split(",").map((v) => parseFloat(v) * (v.trim().endsWith("ms") ? 1 : 1000) || 0);
  const durations = parse(style.transitionDuration);
  const delays = parse(style.transitionDelay);
  return Math.max(0, ...durations.map((d, i) => d + (delays[i] ?? 0)));
}

/** Focus any element; a tabindex added for this is removed again when focus leaves. */
function focusElement(el: HTMLElement) {
  if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
  }
  el.focus({ preventScroll: true });
  el.scrollIntoView?.({ block: "start" });
}

const firstOutside = <T extends Element>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector)).find((el) => !el.closest(IGNORE)) ?? null;

/** The page's main region, else its first <h1>. */
function findMainContent(): HTMLElement | null {
  return firstOutside<HTMLElement>('main, [role="main"]') ?? firstOutside<HTMLElement>("h1");
}

function focusMainContent() {
  const main = findMainContent();
  if (main) focusElement(main);
}

/** True when the page's first focusable element is its own skip link (an in-page link to the main content). */
function pageHasSkipLink(): boolean {
  for (const el of document.body.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (el.closest(IGNORE) || el.tabIndex < 0) continue;
    const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") ?? "" : "";
    if (!/^#./.test(href)) return false;
    let target: HTMLElement | null = null;
    try {
      target = document.getElementById(decodeURIComponent(href.slice(1)));
    } catch {
      return false; // malformed escape in the href
    }
    const main = findMainContent();
    return !!target && !!main && (target === main || target.contains(main) || main.contains(target));
  }
  return false;
}

/** Only http(s), relative and same-scheme URLs — never `javascript:` and friends. */
function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url, window.location.href);
    return protocol === "http:" || protocol === "https:" || protocol === window.location.protocol ? url : null;
  } catch {
    return null;
  }
}

interface Shortcut {
  key: string;
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  /** Normalized for `aria-keyshortcuts`, e.g. "Control+Shift+K". */
  aria: string;
}

const MODIFIERS: Record<string, "Alt" | "Control" | "Shift" | "Meta"> = {
  alt: "Alt",
  option: "Alt",
  ctrl: "Control",
  control: "Control",
  shift: "Shift",
  meta: "Meta",
  cmd: "Meta",
};

function parseShortcut(value: string): Shortcut | null {
  const parts = value.split("+").map((p) => p.trim().toLowerCase()).filter(Boolean);
  const key = parts.pop();
  if (!key) return null;
  const mods = [...new Set(parts.map((p) => MODIFIERS[p]).filter(Boolean))];
  return {
    key,
    alt: mods.includes("Alt"),
    ctrl: mods.includes("Control"),
    shift: mods.includes("Shift"),
    meta: mods.includes("Meta"),
    aria: [...mods, key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1)].join("+"),
  };
}

const isEditable = (t: EventTarget | null | undefined) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

function matchesShortcut(e: KeyboardEvent, s: Shortcut): boolean {
  if (e.repeat || e.altKey !== s.alt || e.ctrlKey !== s.ctrl || e.shiftKey !== s.shift || e.metaKey !== s.meta) {
    return false;
  }
  const key = (e.key ?? "").toLowerCase();
  // The modifier produced a different character (macOS Option+A → "å", Polish "ą"): the visitor is typing.
  if (key.length === 1 && key !== s.key && isEditable(e.composedPath?.()[0] ?? e.target)) return false;
  // `code` keeps working when a modifier changes the produced character outside text fields.
  const code = (e.code ?? "").toLowerCase();
  return key === s.key || code === `key${s.key}` || code === `digit${s.key}`;
}

const BLOCKS = "h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,figcaption,dt,dd,caption,th,td";
const HIDDEN = `${IGNORE}, nav, script, style, noscript, template, [aria-hidden="true"], [hidden]`;

const isInline = (el: Element) => getComputedStyle(el).display.startsWith("inline");

/** Text and links of a block, with images replaced by their alt text. */
function inlineContent(el: Element): (Node | string)[] {
  const out: (Node | string)[] = [];
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) out.push(n.nodeValue ?? "");
    else if (!(n instanceof HTMLElement) || n.matches(HIDDEN)) return;
    else if (n instanceof HTMLImageElement) out.push(n.alt ? ` ${n.alt} ` : "");
    else if (n instanceof HTMLAnchorElement && safeUrl(n.getAttribute("href"))) out.push(h("a", { href: n.href }, ...inlineContent(n)));
    else if (n.tagName === "BR") out.push(" ");
    else out.push(...inlineContent(n));
  });
  return out;
}

/** Pull the main text of the page into clean, linear blocks for read mode. */
function extractReadableContent(imageLabel: string): HTMLElement[] {
  const root =
    document.querySelector<HTMLElement>('main, [role="main"]') ??
    document.querySelector<HTMLElement>("article") ??
    document.body;
  const skip = `${HIDDEN}${root === document.body ? ", header, footer, aside" : ""}`;
  const blocks: HTMLElement[] = [];
  const taken = new Set<Element>();
  const inTaken = (el: Element) => {
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) if (taken.has(p)) return true;
    return false;
  };

  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (inTaken(el) || el.closest(skip) || !el.getClientRects().length) return;
    const tag = el.tagName.toLowerCase();

    if (el instanceof HTMLImageElement) {
      if (el.alt.trim()) blocks.push(h("p", {}, `${imageLabel}: ${el.alt.trim()}`));
      return;
    }
    // Text in a <div>/<section> leaf counts too, not only in <p>, headings and table cells.
    const isBlock = el.matches(BLOCKS);
    const isTextLeaf =
      !isBlock && !isInline(el) && !el.querySelector(BLOCKS) && Array.from(el.children).every(isInline);
    if (!isBlock && !isTextLeaf) return;
    if (!(el.textContent ?? "").trim()) return;

    taken.add(el);
    if (/^h[1-6]$/.test(tag)) blocks.push(h(tag as "h1", {}, ...inlineContent(el)));
    else if (tag === "pre") blocks.push(h("pre", {}, el.textContent ?? ""));
    else if (tag === "blockquote") blocks.push(h("blockquote", {}, ...inlineContent(el)));
    else blocks.push(h("p", { className: tag === "li" ? "a11yw-reader-li" : null }, ...inlineContent(el)));
  });
  return blocks;
}
