import type { AccessibilityLabels, AccessibilityLanguage } from "../labels";
import { DEFAULT_SETTINGS, isDefaultSettings, PROFILE_IDS, RANGES, type RangeKey } from "../settings";
import type {
  AccessibilitySettings,
  AccessibilityState,
  AccessibilityWidgetOptions,
  ProfileId,
  SettingsUpdate,
} from "../types";
import { h, logoNode, trapTab, uid } from "./dom";
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
  destroy(): void;
}

type S = AccessibilitySettings;
type SettingKey = Exclude<keyof S, "profiles">;
type BooleanKey = { [K in keyof S]: S[K] extends boolean ? K : never }[keyof S];
type ColorKey = "textColor" | "titleColor" | "backgroundColor";

const IGNORE = ".a11yw-ignore";
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

export function createUI(opts: AccessibilityWidgetOptions, api: UiApi, locale: UiLocale): Ui {
  const L = locale.labels;
  const syncs: ((s: S) => void)[] = [];
  const sync = (fn: (s: S) => void) => syncs.push(fn);
  const set = api.setSettings;
  const side = opts.position === "right" ? "right" : "left";
  const theme = opts.theme ?? {};
  const shortcut = opts.shortcut === false ? null : parseShortcut(opts.shortcut ?? "Alt+A");

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
    switchRow(label, iconName, (s) => s[key], () => set((s) => ({ [key]: !s[key] }) as Partial<S>));

  /** − value + stepper for percentage settings. */
  const stepperRow = (key: RangeKey, label: string, iconName: IconName) => {
    const { min, max, step } = RANGES[key];
    const labelId = uid();
    const change = (delta: number) => set((s) => ({ [key]: Math.min(max, Math.max(min, s[key] + delta)) }));
    const value = h("output", { className: "a11yw-step-value", "aria-live": "polite" });
    const stepBtn = (name: "minus" | "plus", text: string, delta: number) =>
      h("button", { type: "button", className: "a11yw-step-btn", "aria-label": `${text} ${label}`, onClick: () => change(delta) }, icon(name));
    const dec = stepBtn("minus", L.decrease, -step);
    const inc = stepBtn("plus", L.increase, step);
    const reset = h(
      "button",
      { type: "button", className: "a11yw-mini-btn", "aria-label": `${L.reset} ${label}`, onClick: () => set({ [key]: 100 }) },
      icon("reset")
    );
    // aria-disabled (not `disabled`) keeps focus on the button when a limit is reached.
    sync((s) => {
      const v = s[key];
      value.textContent = `${v}%`;
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
    const id = uid();
    const input = h("input", { id, type: "color", onInput: () => set({ [key]: input.value }) });
    const reset = h(
      "button",
      { type: "button", className: "a11yw-mini-btn", "aria-label": `${L.reset} ${label}`, onClick: () => set({ [key]: null }) },
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

  /** Collapsible section (WAI-ARIA accordion) with a count of active adjustments. */
  const section = (id: string, title: string, iconName: IconName, keys: SettingKey[], ...children: Node[]) => {
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
  const body = h(
    "div",
    { className: "a11yw-body" },
    h(
      "div",
      { role: "group", "aria-labelledby": profilesTitleId },
      h("h3", { id: profilesTitleId, className: "a11yw-block-title" }, L.profilesTitle),
      h("div", { className: "a11yw-profiles" }, ...PROFILE_IDS.map(profileCard))
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
      choiceField("textAlign", L.textAlign, "align", [
        ["default", L.alignDefault],
        ["left", L.alignLeft],
        ["center", L.alignCenter],
        ["right", L.alignRight],
        ["justify", L.alignJustify],
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
      h(
        "button",
        { type: "button", className: "a11yw-row", "aria-haspopup": "dialog", onClick: () => openReader() },
        icon("book"),
        h("span", { className: "a11yw-row-label" }, L.readMode),
        icon("arrow", "a11yw-flip")
      )
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
  const live = h("div", { className: "a11yw-sr-only", role: "status", "aria-live": "polite" });
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
      // Only offer hiding when there is a shortcut to bring the widget back.
      shortcut && h("button", { type: "button", className: "a11yw-link", onClick: hideWidget }, L.hideWidget)
    )
  );

  const launcher = h(
    "button",
    {
      type: "button",
      className: "a11yw-launcher",
      "data-side": side,
      "aria-label": L.launcher,
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

  const widget = h(
    "div",
    {
      className: "a11yw-widget",
      dir: locale.dir,
      lang: locale.language,
      style: {
        "--a11yw-x": `${opts.offset?.x ?? 24}px`,
        "--a11yw-y": `${opts.offset?.y ?? 24}px`,
        "--a11yw-size": `${opts.buttonSize ?? 56}px`,
        "--a11yw-z": opts.zIndex ?? 2147483000,
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
    panel,
    live
  );

  // Placed first in <body> so the skip link and launcher come early in the tab order.
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
    const blocks = extractReadableContent();
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
          h("h2", { id: readerTitleId, className: "a11yw-title" }, L.readMode),
          readerClose
        ),
        h("div", { className: "a11yw-reader-body", tabindex: "0" }, ...(blocks.length ? blocks : [h("p", {}, L.noReadableContent)]))
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
  const showPanel = () => {
    window.clearTimeout(hideTimer);
    panel.hidden = false;
    panel.inert = false;
    void panel.offsetWidth; // commit the start state so the transition runs
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
      syncs.forEach((fn) => fn(state.settings));
      // Small dot on the launcher whenever any adjustment is active.
      launcher.toggleAttribute("data-active", !isDefaultSettings(state.settings));
      if (prev && state.isOpen === prev.isOpen) return;

      launcher.setAttribute("aria-expanded", String(state.isOpen));
      if (state.isOpen) {
        showPanel();
        launcher.hidden = false; // re-shown when reopened after "Hide widget"
        closeBtn.focus();
      } else {
        // Return focus to the launcher unless the user already moved it elsewhere.
        const active = document.activeElement;
        const returnFocus = prev && !launcher.hidden && (!active || active === document.body || panel.contains(active));
        hidePanel();
        if (returnFocus) launcher.focus();
      }
    },
    focusLanguage() {
      langSelect?.focus();
    },
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

/** Longest transition on an element, in ms (0 when motion is reduced or disabled). */
function transitionMs(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const parse = (list: string) => list.split(",").map((v) => parseFloat(v) * (v.trim().endsWith("ms") ? 1 : 1000) || 0);
  const durations = parse(style.transitionDuration);
  const delays = parse(style.transitionDelay);
  return Math.max(0, ...durations.map((d, i) => d + (delays[i] ?? 0)));
}

function focusElement(el: HTMLElement) {
  if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  el.scrollIntoView?.({ block: "start" });
}

function focusMainContent() {
  const main = Array.from(document.querySelectorAll<HTMLElement>('main, [role="main"], h1')).find(
    (el) => !el.closest(IGNORE)
  );
  if (main) focusElement(main);
}

/** Only http(s) and relative URLs — never `javascript:` and friends. */
function safeUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
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
  aria: string;
}

function parseShortcut(value: string): Shortcut | null {
  const parts = value.split("+").map((p) => p.trim().toLowerCase()).filter(Boolean);
  const key = parts.pop();
  if (!key) return null;
  return {
    key,
    alt: parts.includes("alt") || parts.includes("option"),
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    shift: parts.includes("shift"),
    meta: parts.includes("meta") || parts.includes("cmd"),
    aria: value,
  };
}

function matchesShortcut(e: KeyboardEvent, s: Shortcut): boolean {
  if (e.repeat || e.altKey !== s.alt || e.ctrlKey !== s.ctrl || e.shiftKey !== s.shift || e.metaKey !== s.meta) {
    return false;
  }
  // `code` keeps working when a modifier changes the produced character (e.g. Option+A on macOS).
  const code = e.code.toLowerCase();
  return e.key.toLowerCase() === s.key || code === `key${s.key}` || code === `digit${s.key}`;
}

const BLOCKS = "h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,figcaption,dt,dd";

/** Pull the main text of the page into clean, linear blocks for read mode. */
function extractReadableContent(): HTMLElement[] {
  const root =
    document.querySelector<HTMLElement>('main, [role="main"]') ??
    document.querySelector<HTMLElement>("article") ??
    document.body;
  const skip = `${IGNORE}, nav, [aria-hidden="true"], [hidden]${root === document.body ? ", header, footer, aside" : ""}`;
  const blocks: HTMLElement[] = [];

  root.querySelectorAll<HTMLElement>(BLOCKS).forEach((el) => {
    if (el.closest(skip) || !el.getClientRects().length) return;
    const parentBlock = el.parentElement?.closest(BLOCKS);
    if (parentBlock && root.contains(parentBlock)) return; // already included via its parent

    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!text) return;
    const tag = el.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) blocks.push(h(tag as "h1", {}, text));
    else if (tag === "pre") blocks.push(h("pre", {}, el.textContent ?? ""));
    else if (tag === "blockquote") blocks.push(h("blockquote", {}, text));
    else blocks.push(h("p", { className: tag === "li" ? "a11yw-reader-li" : null }, text));
  });
  return blocks;
}
