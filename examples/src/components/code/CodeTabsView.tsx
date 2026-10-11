"use client";

import { useState, type ReactNode } from "react";

import { CopyButton } from "@/components/code/CopyButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface CodeTab {
  label: string;
  /** Plain text the copy button puts on the clipboard. */
  code: string;
  /** The highlighted block, rendered on the server. */
  panel: ReactNode;
}

/** Client half of CodeTabs: tracks the active tab so the one copy button in the bar copies that tab's code. */
export function CodeTabsView({
  tabs,
  label,
  className,
}: {
  tabs: CodeTab[];
  label?: string;
  className?: string;
}) {
  const [value, setValue] = useState("0");
  return (
    <Tabs
      value={value}
      onValueChange={setValue}
      dir="ltr"
      className={cn(
        "min-w-0 gap-0 overflow-hidden rounded-[12px] border border-code-border bg-code",
        className,
      )}
    >
      <div className="flex min-h-11 items-stretch gap-2 border-b border-code-border bg-code-bar pe-1.5 ps-1.5">
        <TabsList
          aria-label={label}
          className="h-auto min-w-0 flex-1 justify-start gap-0.5 overflow-x-auto rounded-none bg-transparent p-0"
        >
          {tabs.map((tab, i) => (
            <TabsTrigger
              key={i}
              value={String(i)}
              className="relative h-auto flex-none rounded-none border-0 px-3 text-caption text-code-foreground/70 shadow-none outline-offset-0 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-ring after:opacity-0 hover:text-code-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-[state=active]:border-0 data-[state=active]:bg-transparent data-[state=active]:text-code-foreground data-[state=active]:shadow-none data-[state=active]:after:opacity-100"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <span className="flex items-center">
          <CopyButton text={tabs[Number(value)]?.code ?? ""} />
        </span>
      </div>
      {tabs.map((tab, i) => (
        <TabsContent key={i} value={String(i)} className="flex min-h-0 flex-1 flex-col">
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
