import type { ReactNode } from "react";

/**
 * Tag handlers for rich messages: `t.rich("key", rich)` turns `<code>x</code>` in a message into inline code
 * (always left-to-right, even in Arabic) and `<strong>x</strong>` into bold text.
 */
export const rich = {
  code: (chunks: ReactNode) => (
    <code
      dir="ltr"
      className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
    >
      {chunks}
    </code>
  ),
  strong: (chunks: ReactNode) => <strong className="font-bold text-foreground">{chunks}</strong>,
};
