/** Languages the syntax highlighter understands. */
export type Lang =
  "ts" | "tsx" | "js" | "jsx" | "html" | "vue" | "svelte" | "astro" | "css" | "bash" | "json";

export type TokenType =
  | "plain"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "tag"
  | "attr"
  | "punct"
  | "fn"
  | "type"
  | "prop"
  | "op";

export type Token = { type: TokenType; text: string };
