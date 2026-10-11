"use client";

import { useLocale } from "next-intl";
import { AccessibilityWidget } from "open-accessibility-widget/react";
import { DIR } from "@/i18n/config";
import { siteWidgetOptions } from "@/lib/widget";

/**
 * The real widget on every page of this site, mounted through the package's own React entry (built from
 * ../src). It lives in the root layout, so it stays mounted (and keeps its state) across client navigations;
 * a language switch is a full page load.
 */
export function SiteWidget() {
  return <AccessibilityWidget {...siteWidgetOptions(DIR[useLocale()])} />;
}
