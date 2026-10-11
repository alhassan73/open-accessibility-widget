import { CodeBlock } from "@/components/code/CodeBlock";
import { CodeTabsView } from "@/components/code/CodeTabsView";
import type { CodeTabItem } from "@/types";

/** One code block per tab, under a single bar. Server component: the highlighting happens at build time. */
export function CodeTabs({
  items,
  label,
  className,
}: {
  items: CodeTabItem[];
  /** Accessible name of the tab list. */
  label?: string;
  className?: string;
}) {
  if (items.length === 1) {
    const only = items[0]!;
    return <CodeBlock code={only.code} lang={only.lang} title={only.label} className={className} />;
  }
  return (
    <CodeTabsView
      label={label}
      className={className}
      tabs={items.map((item) => ({
        label: item.label,
        code: item.code.replace(/\n+$/, ""),
        panel: <CodeBlock code={item.code} lang={item.lang} flush />,
      }))}
    />
  );
}
