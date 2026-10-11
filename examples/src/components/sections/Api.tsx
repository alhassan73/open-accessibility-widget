import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code/CodeBlock";
import { DocSection } from "@/components/layout/DocSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_TABLES, WITH_DEFAULT } from "@/content/api";
import { PKG } from "@/lib/site";
import type { ApiGroup, ApiRow } from "@/types";
import { rich } from "./Rich";

type Cell = ReactNode;

const INSTANCE_SNIPPET = `import { init } from "${PKG}";

const widget = init();

widget.open(); widget.close(); widget.toggle();
widget.getSettings();                                  // a frozen snapshot
widget.setSettings({ fontSize: 120 });                 // validated: bad values are dropped
widget.setSettings((s) => ({ fontSize: s.fontSize + 10 }));
widget.toggleProfile("visionImpaired");
widget.reset();
widget.setOptions({ theme: { primary: "#000000" }, language: "ar" });
const unsubscribe = widget.subscribe(({ settings, isOpen }) => {});
widget.destroy();                                      // removes the widget and undoes every change`;

function DataTable({
  caption,
  scroll,
  head,
  rows,
}: {
  caption: string;
  scroll: string;
  head: string[];
  rows: Cell[][];
}) {
  return (
    <Table scrollLabel={`${scroll} ${caption}`} className="min-w-152">
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {head.map((h) => (
            <TableHead key={h} scope="col">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((cells, i) => (
          <TableRow key={i}>
            {cells.map((cell, j) => (
              <TableCell
                key={j}
                className={j === 0 ? "font-bold text-foreground" : "text-muted-foreground"}
              >
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Left-to-right code in a table cell. */
const Code = ({ children, strong = false }: { children: ReactNode; strong?: boolean }) => (
  <code
    dir="ltr"
    className={`inline-block font-mono text-mono wrap-break-word ${strong ? "text-foreground" : "text-muted-foreground"}`}
  >
    {children}
  </code>
);

/** Body of the API page: one section per table. Each group is a key of "Api.cards" in the messages. */
export function Api() {
  const t = useTranslations("Api");
  const col = (...keys: string[]) => keys.map((k) => t(`cols.${k}`));

  const rows = (group: ApiGroup, items: ApiRow[], withDefault: boolean): Cell[][] =>
    items.map((r) => [
      <Code key="n" strong>
        {r.name}
      </Code>,
      r.type ? <Code key="t">{r.type}</Code> : null,
      ...(withDefault
        ? [r.def ? <Code key="d">{r.def}</Code> : <span key="d" aria-hidden="true">–</span>]
        : []),
      <span key="x">{t.rich(`rows.${group}.${r.id}`, rich)}</span>,
    ]);

  return (
    <>
      {API_TABLES.map(([group, items]) => {
        const withDefault = WITH_DEFAULT.includes(group);
        return (
          <DocSection key={group} id={group} title={t(`cards.${group}.title`)}>
            <p>{t.rich(`cards.${group}.description`, rich)}</p>
            {group === "methods" ? <CodeBlock code={INSTANCE_SNIPPET} lang="ts" /> : null}
            <DataTable
              caption={t(`cards.${group}.title`)}
              scroll={t("scroll")}
              head={col("name", "type", ...(withDefault ? ["def"] : []), "desc")}
              rows={rows(group, items, withDefault)}
            />
          </DocSection>
        );
      })}
    </>
  );
}
