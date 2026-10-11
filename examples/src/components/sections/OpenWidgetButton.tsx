"use client";

import type { VariantProps } from "class-variance-authority";
import { useAccessibility } from "open-accessibility-widget/react";
import { WidgetIcon } from "@/components/layout/WidgetIcon";
import { Button, type buttonVariants } from "@/components/ui/button";

/**
 * Opens the site's own widget. Disabled until the widget has mounted (on the server and during hydration
 * there is none yet). The widget moves focus into its panel and back here when it closes.
 */
export function OpenWidgetButton({
  label,
  variant,
  size,
  className,
}: {
  label: string;
  className?: string;
} & VariantProps<typeof buttonVariants>) {
  const { widget } = useAccessibility();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={!widget}
      aria-haspopup="dialog"
      onClick={() => widget?.open()}
    >
      <WidgetIcon />
      {label}
    </Button>
  );
}
