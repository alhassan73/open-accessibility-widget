/** Docs pages are wider than the rest of the site (three columns); same gutters, so header and footer still line up. */
export const DOCS_CONTAINER = "mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-8";

/** Page titles in the content column (h1 of a docs page): 32px, 40px from `sm`. Arabic gets no negative tracking. */
export const docsH1 =
  "text-[2rem] leading-[1.15] font-extrabold tracking-[-0.025em] text-balance text-foreground sm:text-[2.5rem] rtl:leading-[1.4] rtl:tracking-normal";

/** Section headings: 26px / 800. The section above supplies the 48px top margin and the 1px rule. */
export const docsH2 =
  "text-[1.625rem] leading-tight font-extrabold tracking-[-0.02em] text-foreground rtl:leading-snug rtl:tracking-normal";

/** Sub-headings: 20px / 700. */
export const docsH3 = "text-xl leading-snug font-bold text-foreground";
