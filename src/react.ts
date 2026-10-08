import { useEffect, useRef, useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS } from "./settings";
import type {
  AccessibilitySettings,
  AccessibilityState,
  AccessibilityWidgetInstance,
  AccessibilityWidgetOptions,
} from "./types";
import { createAccessibilityWidget, getAccessibilityWidget, onActiveWidgetChange } from "./widget";

export * from "./index";

export type AccessibilityWidgetProps = AccessibilityWidgetOptions;

/** Serializable view of the options, used to detect real changes between renders. */
const optionsKey = (options: AccessibilityWidgetOptions) =>
  JSON.stringify(options, (_key, value: unknown) =>
    typeof value === "function"
      ? undefined
      : typeof Element !== "undefined" && value instanceof Element
        ? value.outerHTML
        : value
  );

/**
 * Drop-in React component. Renders nothing itself — the widget mounts on <body>.
 * Works in React 18/19, Next.js (App & Pages router), Remix, Gatsby, Vite…
 */
export function AccessibilityWidget(props: AccessibilityWidgetProps): null {
  const latest = useRef(props);
  const instance = useRef<AccessibilityWidgetInstance | null>(null);
  const key = optionsKey(props);
  const appliedKey = useRef(key);
  const appliedProps = useRef<AccessibilityWidgetOptions>(props);

  useEffect(() => {
    latest.current = props;
  });

  const resolved = (): AccessibilityWidgetOptions => ({
    ...latest.current,
    onChange: (settings) => latest.current.onChange?.(settings),
  });

  useEffect(() => {
    const widget = createAccessibilityWidget(resolved());
    instance.current = widget;
    appliedProps.current = latest.current;
    return () => {
      widget.destroy();
      instance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!instance.current || appliedKey.current === key) return;
    appliedKey.current = key;
    // setOptions() merges, so a prop removed since the last render is passed as `undefined`.
    const removed = Object.fromEntries(Object.keys(appliedProps.current).map((k) => [k, undefined]));
    appliedProps.current = latest.current;
    instance.current.setOptions({ ...removed, ...resolved() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}

function subscribe(onStoreChange: () => void) {
  let unsubscribeWidget = () => {};
  const bind = () => {
    unsubscribeWidget();
    const off = getAccessibilityWidget()?.subscribe(onStoreChange);
    unsubscribeWidget = () => off?.();
    onStoreChange();
  };
  const offActive = onActiveWidgetChange(bind);
  bind();
  return () => {
    offActive();
    unsubscribeWidget();
  };
}

const getSnapshot = (): AccessibilityState | null => getAccessibilityWidget()?.getState() ?? null;
const getServerSnapshot = () => null;

export interface UseAccessibilityResult {
  settings: AccessibilitySettings;
  isOpen: boolean;
  /** The live widget (open, close, setSettings, reset…), or `null` before it mounts. */
  widget: AccessibilityWidgetInstance | null;
}

/** Read and control the widget from any component, e.g. a footer "Accessibility" link. */
export function useAccessibility(): UseAccessibilityResult {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    settings: state?.settings ?? DEFAULT_SETTINGS,
    isOpen: state?.isOpen ?? false,
    // Tied to the snapshot, so server render and hydration agree (both `null`).
    widget: state ? getAccessibilityWidget() : null,
  };
}
