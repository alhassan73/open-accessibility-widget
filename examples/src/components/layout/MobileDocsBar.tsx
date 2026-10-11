"use client";

import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { DOCS_CONTAINER } from "./docs-styles";

interface MobileDocsBarProps {
  /** The page's title, shown beside the button. */
  title: string;
  menuLabel: string;
  sheetTitle: string;
  sheetDescription: string;
  closeLabel: string;
  /** The docs sidebar, rendered on the server. */
  children: ReactNode;
}

/** Below `lg` there is no sidebar column: a slim bar under the header opens the sidebar in a sheet. */
export function MobileDocsBar({
  title,
  menuLabel,
  sheetTitle,
  sheetDescription,
  closeLabel,
  children,
}: MobileDocsBarProps) {
  const pathname = usePathname();
  // The sheet is open for the page it was opened on, so choosing another page closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  return (
    <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur-md lg:hidden">
      <div className={cn(DOCS_CONTAINER, "flex h-12 items-center gap-3")}>
        <Sheet
          open={openOn === pathname}
          onOpenChange={(open) => setOpenOn(open ? pathname : null)}
        >
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="-ms-3 shrink-0">
              <Menu aria-hidden="true" />
              {menuLabel}
            </Button>
          </SheetTrigger>
          {/* "start" is the side the sidebar is on from `lg` up: left in English, right in Arabic. */}
          <SheetContent side="start" closeLabel={closeLabel} className="gap-0">
            <SheetHeader className="border-b">
              <SheetTitle>{sheetTitle}</SheetTitle>
              <SheetDescription className="sr-only">{sheetDescription}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-3">{children}</div>
          </SheetContent>
        </Sheet>
        <span aria-hidden="true" className="truncate text-small text-muted-foreground">
          {title}
        </span>
      </div>
    </div>
  );
}
