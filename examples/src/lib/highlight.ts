/**
 * Our own syntax highlighter. No dependency: one small single-pass scanner per language family
 * (JS/TS/JSX, HTML-like markup, CSS, shell, JSON). Every scanner only moves forward, so the whole
 * run is linear in the input, and every character lands in exactly one token, so joining the
 * tokens of all lines (with "\n" between lines) gives the input back unchanged.
 */

import type { Lang, Token, TokenType } from "@/types";

/** Nesting limit for templates, JSX and markup expressions, so hostile input cannot blow the stack. */
const MAX_DEPTH = 32;

/** Token sink: merges neighbours of the same type to keep the DOM small. */
class Out {
  tokens: Token[] = [];
  add(type: TokenType, text: string): void {
    if (!text) return;
    const last = this.tokens[this.tokens.length - 1];
    if (last && last.type === type) last.text += text;
    else this.tokens.push({ type, text });
  }
}

type Ch = string | undefined;

const isSpace = (c: Ch) => c === " " || c === "\n" || c === "\t" || c === "\r" || c === "\f";
const isDigit = (c: Ch) => c !== undefined && c >= "0" && c <= "9";
const isLetter = (c: Ch) => c !== undefined && ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z"));
const isUpper = (c: Ch) => c !== undefined && c >= "A" && c <= "Z";
const isHex = (c: Ch) =>
  c !== undefined && ((c >= "0" && c <= "9") || (c >= "a" && c <= "f") || (c >= "A" && c <= "F"));
const isIdStart = (c: Ch) =>
  isLetter(c) || c === "_" || c === "$" || (c !== undefined && c > "\x7f");
const isIdPart = (c: Ch) => isIdStart(c) || isDigit(c);

function skipSpace(s: string, i: number): number {
  while (i < s.length && isSpace(s[i])) i++;
  return i;
}

function lineEnd(s: string, i: number): number {
  const k = s.indexOf("\n", i);
  return k < 0 ? s.length : k;
}

/** Emits the whitespace run at `i` as plain text and returns the index after it. */
function ws(s: string, i: number, out: Out): number {
  const j = skipSpace(s, i);
  out.add("plain", s.slice(i, j));
  return j;
}

/** End of a quoted string that starts at `i`. An unterminated string stops at the end of the line. */
function scanQuoted(s: string, i: number): number {
  const q = s[i];
  const n = s.length;
  let j = i + 1;
  while (j < n) {
    const c = s[j];
    if (c === "\\") j += 2;
    else if (c === q) return j + 1;
    else if (c === "\n") return j;
    else j++;
  }
  return n;
}

// ---------------------------------------------------------------------------------------------
// JavaScript / TypeScript / JSX
// ---------------------------------------------------------------------------------------------

const KEYWORDS = new Set(
  (
    "break case catch class const continue debugger default delete do else enum export extends " +
    "false finally for function if implements import in instanceof interface let new null return " +
    "super switch this throw true try typeof undefined var void while with yield await async " +
    "static NaN Infinity keyof satisfies infer"
  ).split(" "),
);
/** Words that are only keywords in some positions; `isContextual` decides. */
const CONTEXTUAL = new Set(
  (
    "type from as of get set is readonly public private protected abstract override declare " +
    "namespace module accessor"
  ).split(" "),
);
const MODIFIERS = new Set(
  "readonly public private protected abstract override declare accessor".split(" "),
);
const PRIMITIVES = new Set(
  "string number boolean any unknown never object symbol bigint void".split(" "),
);
/** After these keywords a name is a type (or a class being created). */
const TYPE_AFTER = new Set(
  "class interface enum extends implements new instanceof type namespace".split(" "),
);
/** After these keywords a new expression can start (a `/` is a regex, a `<` can be JSX). */
const EXPR_KEYWORDS = new Set(
  "return typeof instanceof in of new delete void throw case do else yield await default extends".split(
    " ",
  ),
);
const OP_CHARS = "+-*/%=<>!&|^~?";

type Prev = "none" | "ident" | "kw" | "num" | "str" | "punct" | "op";

type JsOpts = {
  jsx: boolean;
  ts: boolean;
  /** Stop (without consuming it) at this text when it appears outside nested braces. */
  closer: string | null;
  level: number;
};

function scanNumber(s: string, i: number): number {
  let j = i;
  if (s[j] === "0" && "xXbBoO".includes(s[j + 1] ?? "-")) {
    j += 2;
    while (isHex(s[j]) || s[j] === "_") j++;
  } else {
    while (isDigit(s[j]) || s[j] === "_") j++;
    if (s[j] === "." && isDigit(s[j + 1])) {
      j++;
      while (isDigit(s[j]) || s[j] === "_") j++;
    }
    const e = s[j];
    if (e === "e" || e === "E") {
      const sign = s[j + 1] === "+" || s[j + 1] === "-" ? 1 : 0;
      if (isDigit(s[j + 1 + sign])) {
        j += 1 + sign;
        while (isDigit(s[j])) j++;
      }
    }
  }
  if (s[j] === "n") j++;
  return j;
}

/** End of a regex literal at `i`, or -1 when it does not look like one (bounded, so it stays linear). */
function scanRegex(s: string, i: number): number {
  const limit = Math.min(s.length, i + 300);
  let inClass = false;
  for (let j = i + 1; j < limit; j++) {
    const c = s[j];
    if (c === "\n") return -1;
    if (c === "\\") j++;
    else if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      j++;
      while (isLetter(s[j])) j++;
      return j;
    }
  }
  return -1;
}

function scanTemplate(s: string, i: number, out: Out, o: JsOpts): number {
  const n = s.length;
  let j = i + 1;
  let seg = i;
  while (j < n) {
    const c = s[j];
    if (c === "\\") {
      j += 2;
    } else if (c === "`") {
      j++;
      out.add("string", s.slice(seg, j));
      return j;
    } else if (c === "$" && s[j + 1] === "{" && o.level < MAX_DEPTH) {
      out.add("string", s.slice(seg, j));
      out.add("punct", "${");
      j = scanJs(s, j + 2, out, { ...o, closer: "}", level: o.level + 1 });
      if (s[j] === "}") {
        out.add("punct", "}");
        j++;
      }
      seg = j;
    } else {
      j++;
    }
  }
  out.add("string", s.slice(seg));
  return n;
}

/** Is the `<...>` at `j` the type arguments of a call, as in `useState<string>(`? Bounded, so it stays linear. */
function isGenericCall(s: string, j: number): boolean {
  let depth = 0;
  const limit = Math.min(s.length, j + 120);
  for (let k = j; k < limit; k++) {
    const c = s[k]!;
    if (c === "<") depth++;
    else if (c === ">") {
      if (--depth === 0) return s[k + 1] === "(";
    } else if (!(isIdPart(c) || isSpace(c) || ",.[]|&:?{}'\"=".includes(c))) return false;
  }
  return false;
}

/** Is `w` (followed by position `j`) a keyword here? Only for the words in CONTEXTUAL. */
function isContextual(w: string, s: string, j: number, pk: Prev, pt: string): boolean {
  const nx = s[skipSpace(s, j)];
  const endsExpr =
    pk === "ident" ||
    pk === "num" ||
    pk === "str" ||
    (pk === "punct" && (pt === ")" || pt === "]" || pt === "}")) ||
    (pk === "op" && pt === "*") ||
    (pk === "kw" && (pt === "this" || pt === "true" || pt === "false" || pt === "null"));
  if (MODIFIERS.has(w)) return isIdStart(nx) || nx === "[";
  switch (w) {
    case "from":
      return nx === '"' || nx === "'";
    case "type":
      return isIdStart(nx) || nx === "{" || nx === "*";
    case "as":
      return endsExpr && (isIdStart(nx) || nx === "{");
    case "of":
      return endsExpr && nx !== undefined && (isIdStart(nx) || "[({\"'`".includes(nx));
    case "get":
    case "set":
      return isIdStart(nx) || nx === "[" || nx === '"' || nx === "'";
    case "is":
      return pk === "ident" && isIdStart(nx);
    default: // namespace, module
      return isIdStart(nx) || nx === '"' || nx === "'";
  }
}

/** Scans JavaScript/TypeScript from `from`. Returns where it stopped (at `o.closer`, or the end). */
function scanJs(s: string, from: number, out: Out, o: JsOpts): number {
  const n = s.length;
  let i = from;
  let braces = 0;
  let stack = ""; // open brackets, innermost last
  let pk = "none" as Prev;
  let pt = "";
  let nl = true; // a newline came after the last real token
  const emit = (kind: Prev, type: TokenType, text: string) => {
    out.add(type, text);
    pk = kind;
    pt = text;
    nl = false;
  };
  const exprOk = () =>
    pk === "none" ||
    pk === "op" ||
    (pk === "punct" && pt !== ")" && pt !== "]" && pt !== "}") ||
    (pk === "kw" && EXPR_KEYWORDS.has(pt));

  while (i < n) {
    const c = s[i]!;
    if (o.closer !== null && braces === 0 && s.startsWith(o.closer, i)) return i;

    if (isSpace(c)) {
      const j = skipSpace(s, i);
      const text = s.slice(i, j);
      if (text.includes("\n")) nl = true;
      out.add("plain", text);
      i = j;
      continue;
    }
    if (c === "/" && s[i + 1] === "/") {
      const e = lineEnd(s, i);
      out.add("comment", s.slice(i, e));
      i = e;
      continue;
    }
    if (c === "/" && s[i + 1] === "*") {
      const k = s.indexOf("*/", i + 2);
      const e = k < 0 ? n : k + 2;
      out.add("comment", s.slice(i, e));
      i = e;
      continue;
    }
    if (c === '"' || c === "'") {
      const e = scanQuoted(s, i);
      emit("str", "string", s.slice(i, e));
      i = e;
      continue;
    }
    if (c === "`") {
      i = scanTemplate(s, i, out, o);
      pk = "str";
      pt = "";
      nl = false;
      continue;
    }
    if (isDigit(c) || (c === "." && isDigit(s[i + 1]))) {
      const e = scanNumber(s, i);
      emit("num", "number", s.slice(i, e));
      i = e;
      continue;
    }
    if (isIdStart(c) || (c === "#" && isIdStart(s[i + 1]))) {
      let j = i + (c === "#" ? 1 : 0);
      while (isIdPart(s[j])) j++;
      const word = s.slice(i, j);
      const nx = s[j];
      let type: TokenType = "plain";
      let kind: Prev = "ident";
      const isKey =
        ((nx === ":" && s[j + 1] !== ":") || (nx === "?" && s[j + 1] === ":")) &&
        stack.endsWith("{") &&
        ((pk === "punct" && (pt === "{" || pt === "," || pt === ";")) || nl);
      if (c === "#" || (pk === "punct" && pt === ".")) {
        type = nx === "(" ? "fn" : "prop";
      } else if (KEYWORDS.has(word)) {
        const voidType =
          word === "void" &&
          o.ts &&
          (pt === ":" || pt === "<" || pt === "|" || pt === "&" || pt === "=>");
        if (voidType) type = "type";
        else {
          type = "keyword";
          kind = "kw";
        }
      } else if (isKey) {
        type = "prop";
      } else if (CONTEXTUAL.has(word) && isContextual(word, s, j, pk, pt)) {
        type = "keyword";
        kind = "kw";
      } else if (o.ts && PRIMITIVES.has(word)) {
        type = nx === "(" ? "fn" : "type";
      } else if (pk === "kw" && pt === "function") {
        type = "fn";
      } else if (pk === "kw" && TYPE_AFTER.has(pt) && s[skipSpace(s, j)] !== ".") {
        type = nx === "(" && !isUpper(word[0]) ? "fn" : "type";
      } else if (!isUpper(word[0]) && (nx === "(" || (o.ts && nx === "<" && isGenericCall(s, j)))) {
        type = "fn";
      } else if (isUpper(word[0]) && (word.length === 1 || /[a-z]/.test(word))) {
        type = "type";
      }
      emit(kind, type, word);
      i = j;
      continue;
    }
    if (c === "/" && exprOk()) {
      const e = scanRegex(s, i);
      if (e > 0) {
        emit("str", "string", s.slice(i, e));
        i = e;
        continue;
      }
    }
    if (
      c === "<" &&
      o.jsx &&
      o.level < MAX_DEPTH &&
      exprOk() &&
      (isIdStart(s[i + 1]) || s[i + 1] === ">")
    ) {
      i = scanJsx(s, i, out, o);
      pk = "str";
      pt = "";
      nl = false;
      continue;
    }
    if (OP_CHARS.includes(c)) {
      let j = i + 1;
      while (
        j < n &&
        j - i < 4 &&
        OP_CHARS.includes(s[j]!) &&
        !(s[j] === "/" && (s[j + 1] === "/" || s[j + 1] === "*")) &&
        !(o.jsx && s[j] === "<" && (isIdStart(s[j + 1]) || s[j + 1] === ">"))
      ) {
        j++;
      }
      emit("op", "op", s.slice(i, j));
      i = j;
      continue;
    }
    if (c === "@") {
      emit("op", "op", "@");
      i++;
      continue;
    }
    if (c === ".") {
      const text = s.startsWith("...", i) ? "..." : ".";
      emit("punct", "punct", text);
      i += text.length;
      continue;
    }
    if ("(),;:[]{}".includes(c)) {
      if (c === "{") braces++;
      else if (c === "}" && braces > 0) braces--;
      if (c === "(" || c === "[" || c === "{") stack += c;
      else if (c === ")" || c === "]" || c === "}") stack = stack.slice(0, -1);
      emit("punct", "punct", c);
      i++;
      continue;
    }
    out.add("plain", c);
    i++;
  }
  return i;
}

/** JSX element starting at the `<` at `i`. Returns the index after the element. */
function scanJsx(s: string, i: number, out: Out, o: JsOpts): number {
  const n = s.length;
  const inner: JsOpts = { ...o, closer: "}", level: o.level + 1 };
  const expr = (at: number): number => {
    out.add("punct", "{");
    const j = scanJs(s, at + 1, out, inner);
    if (s[j] === "}") {
      out.add("punct", "}");
      return j + 1;
    }
    return j;
  };
  const tagName = (at: number): number => {
    let j = at;
    while (j < n && (isIdPart(s[j]) || s[j] === "." || s[j] === ":" || s[j] === "-")) j++;
    out.add("tag", s.slice(at, j));
    return j;
  };

  out.add("punct", "<");
  let j = tagName(i + 1);
  // attributes
  for (;;) {
    j = ws(s, j, out);
    if (j >= n) return n;
    const c = s[j]!;
    if (c === ">") {
      out.add("punct", ">");
      j++;
      break;
    }
    if (c === "/" && s[j + 1] === ">") {
      out.add("punct", "/>");
      return j + 2;
    }
    if (c === "{") {
      j = expr(j);
      continue;
    }
    if (isIdStart(c)) {
      let k = j;
      while (k < n && (isIdPart(s[k]) || s[k] === "-" || s[k] === ":" || s[k] === ".")) k++;
      out.add("attr", s.slice(j, k));
      j = k;
      const eq = skipSpace(s, j);
      if (s[eq] !== "=") continue;
      out.add("plain", s.slice(j, eq));
      out.add("punct", "=");
      j = ws(s, eq + 1, out);
      const v = s[j];
      if (v === '"' || v === "'") {
        const k2 = s.indexOf(v, j + 1);
        const e = k2 < 0 ? n : k2 + 1;
        out.add("string", s.slice(j, e));
        j = e;
      } else if (v === "{") {
        j = expr(j);
      } else if (v === "<" && o.level + 1 < MAX_DEPTH) {
        j = scanJsx(s, j, out, inner);
      }
      continue;
    }
    out.add("plain", c);
    j++;
  }
  // children
  for (;;) {
    let k = j;
    while (k < n && s[k] !== "<" && s[k] !== "{") k++;
    out.add("plain", s.slice(j, k));
    j = k;
    if (j >= n) return n;
    if (s[j] === "{") {
      j = expr(j);
    } else if (s[j + 1] === "/") {
      out.add("punct", "</");
      j = tagName(j + 2);
      j = ws(s, j, out);
      if (s[j] === ">") {
        out.add("punct", ">");
        j++;
      }
      return j;
    } else if ((isIdStart(s[j + 1]) || s[j + 1] === ">") && o.level + 1 < MAX_DEPTH) {
      j = scanJsx(s, j, out, inner);
    } else {
      out.add("plain", "<");
      j++;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// HTML-like markup: html, vue, svelte, astro
// ---------------------------------------------------------------------------------------------

type Markup = "html" | "vue" | "svelte" | "astro";
type Embedded = "ts" | "tsx" | "css" | "json";

const SCRIPT_END = /<\/script/gi;
const STYLE_END = /<\/style/gi;
/** Attribute names whose value is a JavaScript expression (Vue, Angular, Alpine style). */
const EXPR_ATTR = /^(?::|@|v-|\[|\(|\*)/;

function embed(out: Out, text: string, lang: Embedded): void {
  if (lang === "css") scanCss(text, out);
  else if (lang === "json") scanJson(text, out);
  else scanJs(text, 0, out, { jsx: lang === "tsx", ts: true, closer: null, level: 0 });
}

type TagInfo = { lang?: string; type?: string; selfClosing?: boolean };

/** `{ ... }` expression in markup (Svelte, Astro). Svelte block tags like `{#if x}` get a keyword. */
function scanBraceExpr(s: string, i: number, out: Out, kind: Markup): number {
  out.add("punct", "{");
  let j = i + 1;
  const m = s[j];
  if (kind === "svelte" && (m === "#" || m === ":" || m === "/" || m === "@")) {
    out.add("punct", m);
    j++;
    let k = j;
    while (isLetter(s[k])) k++;
    out.add("keyword", s.slice(j, k));
    j = k;
  }
  j = scanJs(s, j, out, { jsx: kind === "astro", ts: true, closer: "}", level: 1 });
  if (s[j] === "}") {
    out.add("punct", "}");
    j++;
  }
  return j;
}

/** `{{ expr }}` (Vue, Angular). */
function scanMustache(s: string, i: number, out: Out): number {
  out.add("punct", "{{");
  let j = scanJs(s, i + 2, out, { jsx: false, ts: true, closer: "}}", level: 1 });
  if (s.startsWith("}}", j)) {
    out.add("punct", "}}");
    j += 2;
  }
  return j;
}

/** Text of a quoted attribute value with `{expr}` parts (Svelte, Astro). */
function scanInterp(text: string, out: Out, kind: Markup): void {
  let i = 0;
  while (i < text.length) {
    const k = text.indexOf("{", i);
    if (k < 0) {
      out.add("string", text.slice(i));
      return;
    }
    out.add("string", text.slice(i, k));
    i = scanBraceExpr(text, k, out, kind);
  }
}

function scanAttrValue(
  s: string,
  at: number,
  out: Out,
  kind: Markup,
  name: string,
  info: TagInfo,
): number {
  const n = s.length;
  const brace = kind === "svelte" || kind === "astro";
  const c = s[at];
  if (c === '"' || c === "'") {
    const close = s.indexOf(c, at + 1);
    const end = close < 0 ? n : close;
    const content = s.slice(at + 1, end);
    out.add("string", c);
    if (!brace && EXPR_ATTR.test(name)) embed(out, content, "ts");
    else if (brace) scanInterp(content, out, kind);
    else out.add("string", content);
    if (close >= 0) out.add("string", c);
    if (name === "lang") info.lang = content;
    else if (name === "type") info.type = content;
    return close < 0 ? n : close + 1;
  }
  if (brace && c === "{") return scanBraceExpr(s, at, out, kind);
  let k = at;
  while (k < n && !isSpace(s[k]) && s[k] !== ">") k++;
  out.add("string", s.slice(at, k));
  return k;
}

function scanTag(s: string, i: number, out: Out, kind: Markup): number {
  const n = s.length;
  const brace = kind === "svelte" || kind === "astro";
  const closing = s[i + 1] === "/";
  out.add("punct", closing ? "</" : "<");
  const ns = i + (closing ? 2 : 1);
  let j = ns;
  if (s[j] === "!") j++;
  while (j < n && !isSpace(s[j]) && s[j] !== ">" && s[j] !== "/") j++;
  const name = s.slice(ns, j);
  out.add("tag", name);

  const info: TagInfo = {};
  for (;;) {
    j = ws(s, j, out);
    if (j >= n) return n;
    const c = s[j]!;
    if (c === ">") {
      out.add("punct", ">");
      j++;
      break;
    }
    if (c === "/" && s[j + 1] === ">") {
      info.selfClosing = true;
      out.add("punct", "/>");
      j += 2;
      break;
    }
    if (brace && c === "{") {
      j = scanBraceExpr(s, j, out, kind);
      continue;
    }
    let k = j;
    while (
      k < n &&
      !isSpace(s[k]) &&
      s[k] !== "=" &&
      s[k] !== ">" &&
      s[k] !== '"' &&
      s[k] !== "'" &&
      !(s[k] === "/" && s[k + 1] === ">") &&
      !(brace && s[k] === "{")
    ) {
      k++;
    }
    if (k === j) {
      out.add(c === "=" ? "punct" : "plain", c);
      j++;
      continue;
    }
    const attr = s.slice(j, k);
    out.add("attr", attr);
    j = k;
    const eq = skipSpace(s, j);
    if (s[eq] === "=") {
      out.add("plain", s.slice(j, eq));
      out.add("punct", "=");
      const v = skipSpace(s, eq + 1);
      out.add("plain", s.slice(eq + 1, v));
      j = scanAttrValue(s, v, out, kind, attr, info);
    }
  }
  if (closing || info.selfClosing) return j;

  const lower = name.toLowerCase();
  if (lower === "script" || lower === "style") {
    const re = lower === "script" ? SCRIPT_END : STYLE_END;
    re.lastIndex = j;
    const m = re.exec(s);
    const end = m ? m.index : n;
    let lang: Embedded = "css";
    if (lower === "script") {
      if (info.type?.includes("json")) lang = "json";
      else lang = info.lang === "tsx" || info.lang === "jsx" ? "tsx" : "ts";
    }
    embed(out, s.slice(j, end), lang);
    return end;
  }
  return j;
}

/** Astro `---` frontmatter: returns the index after the closing fence, or 0 when there is none. */
function scanFrontmatter(s: string, out: Out): number {
  const open = /^---[ \t]*\r?\n/.exec(s);
  if (!open) return 0;
  const start = open[0].length;
  for (let p = start; p <= s.length;) {
    const e = lineEnd(s, p);
    if (s.slice(p, e).trimEnd() === "---") {
      out.add("punct", "---");
      out.add("plain", open[0].slice(3));
      embed(out, s.slice(start, p), "ts");
      out.add("punct", "---");
      out.add("plain", s.slice(p + 3, e));
      return e;
    }
    if (e >= s.length) break;
    p = e + 1;
  }
  return 0;
}

function scanMarkup(s: string, out: Out, kind: Markup): void {
  const n = s.length;
  let i = kind === "astro" ? scanFrontmatter(s, out) : 0;
  while (i < n) {
    const c = s[i]!;
    if (c === "<") {
      if (s.startsWith("<!--", i)) {
        const k = s.indexOf("-->", i + 4);
        const e = k < 0 ? n : k + 3;
        out.add("comment", s.slice(i, e));
        i = e;
        continue;
      }
      const closing = s[i + 1] === "/";
      if (isLetter(s[i + (closing ? 2 : 1)]) || (!closing && s[i + 1] === "!")) {
        i = scanTag(s, i, out, kind);
      } else {
        out.add("plain", "<");
        i++;
      }
      continue;
    }
    if (c === "{") {
      if (kind === "html" || kind === "vue") {
        if (s[i + 1] === "{") i = scanMustache(s, i, out);
        else {
          out.add("plain", "{");
          i++;
        }
      } else {
        i = scanBraceExpr(s, i, out, kind);
      }
      continue;
    }
    let j = i + 1;
    while (j < n && s[j] !== "<" && s[j] !== "{") j++;
    out.add("plain", s.slice(i, j));
    i = j;
  }
}

// ---------------------------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------------------------

const PRELUDE_WORDS = new Set(["and", "or", "not", "only"]);

const isCssIdentChar = (c: Ch) =>
  isLetter(c) ||
  isDigit(c) ||
  c === "-" ||
  c === "_" ||
  c === "\\" ||
  (c !== undefined && c > "\x7f");

function readCssIdent(s: string, i: number): number {
  let j = i;
  while (j < s.length) {
    const c = s[j];
    if (c === "\\") j += 2;
    else if (isCssIdentChar(c)) j++;
    else break;
  }
  return Math.min(j, s.length);
}

function cssComment(s: string, i: number, out: Out): number {
  const k = s.indexOf("*/", i + 2);
  const e = k < 0 ? s.length : k + 2;
  out.add("comment", s.slice(i, e));
  return e;
}

/** Last lookahead result, so garbage that never ends a statement is not rescanned (stays linear). */
type Look = { end: number; kind: string };

/** Is the statement at `i` a rule (ends with `{`) or a declaration (ends with `;` or `}`)? */
function cssLook(s: string, i: number, memo: Look): string {
  if (i <= memo.end) return memo.kind;
  const kind = cssLookScan(s, i, memo);
  return kind;
}

function cssLookScan(s: string, i: number, memo: Look): string {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (c === "/" && s[j + 1] === "*") {
      const k = s.indexOf("*/", j + 2);
      if (k < 0) break;
      j = k + 1;
    } else if (c === '"' || c === "'") {
      j = scanQuoted(s, j) - 1;
    } else if (c === "(") {
      depth++;
    } else if (c === ")") {
      if (depth > 0) depth--;
    } else if (depth === 0 && (c === "{" || c === ";" || c === "}")) {
      memo.end = j;
      memo.kind = c;
      return c;
    }
  }
  memo.end = s.length;
  memo.kind = ";";
  return ";";
}

function cssAttrSelector(s: string, i: number, out: Out): number {
  const n = s.length;
  out.add("punct", "[");
  let j = ws(s, i + 1, out);
  let k = j;
  while (k < n && s[k] !== "]" && s[k] !== "{" && !isSpace(s[k]) && !"~|^$*=".includes(s[k]!)) k++;
  out.add("attr", s.slice(j, k));
  j = ws(s, k, out);
  k = j;
  while (k < n && "~|^$*=".includes(s[k]!)) k++;
  out.add("op", s.slice(j, k));
  j = ws(s, k, out);
  if (s[j] === '"' || s[j] === "'") {
    k = scanQuoted(s, j);
  } else {
    k = j;
    while (k < n && s[k] !== "]" && s[k] !== "{" && !isSpace(s[k])) k++;
  }
  out.add("string", s.slice(j, k));
  j = ws(s, k, out);
  k = j;
  while (k < n && s[k] !== "]" && s[k] !== "{") k++; // flags such as `i`
  out.add("keyword", s.slice(j, k));
  if (s[k] === "]") {
    out.add("punct", "]");
    k++;
  }
  return k;
}

function cssSelector(s: string, from: number, out: Out): number {
  const n = s.length;
  let i = from;
  while (i < n && s[i] !== "{") {
    const c = s[i]!;
    if (isSpace(c)) {
      i = ws(s, i, out);
    } else if (c === "/" && s[i + 1] === "*") {
      i = cssComment(s, i, out);
    } else if (c === '"' || c === "'") {
      const e = scanQuoted(s, i);
      out.add("string", s.slice(i, e));
      i = e;
    } else if ((c === "." || c === "#") && readCssIdent(s, i + 1) > i + 1) {
      const e = readCssIdent(s, i + 1);
      out.add("type", s.slice(i, e));
      i = e;
    } else if (c === ":") {
      let e = i + 1;
      if (s[e] === ":") e++;
      e = readCssIdent(s, e);
      const text = s.slice(i, e);
      out.add("keyword", text);
      i = e;
      if (text.startsWith(":nth-") && s[i] === "(") {
        const close = s.indexOf(")", i);
        const stop = close < 0 ? n : close;
        out.add("punct", "(");
        out.add("number", s.slice(i + 1, stop));
        i = stop;
      }
    } else if (c === "[") {
      i = cssAttrSelector(s, i, out);
    } else if (c === "(" || c === ")" || c === ",") {
      out.add("punct", c);
      i++;
    } else if (">+~*&|^$=".includes(c)) {
      out.add("op", c);
      i++;
    } else if (isDigit(c)) {
      let e = i + 1;
      while (isDigit(s[e]) || s[e] === "." || s[e] === "%") e++;
      out.add("number", s.slice(i, e));
      i = e;
    } else if (isCssIdentChar(c)) {
      const e = readCssIdent(s, i);
      out.add("tag", s.slice(i, e));
      i = e;
    } else {
      out.add("plain", c);
      i++;
    }
  }
  return i;
}

/** Values (and at-rule preludes) up to a top-level `;`, `{` or `}`, which are left for the caller. */
function cssValue(s: string, from: number, out: Out, prelude: boolean): number {
  const n = s.length;
  let i = from;
  let depth = 0;
  while (i < n) {
    const c = s[i]!;
    if (depth === 0 && (c === ";" || c === "}" || c === "{")) return i;
    if (isSpace(c)) {
      i = ws(s, i, out);
    } else if (c === "/" && s[i + 1] === "*") {
      i = cssComment(s, i, out);
    } else if (c === '"' || c === "'") {
      const e = scanQuoted(s, i);
      out.add("string", s.slice(i, e));
      i = e;
    } else if (c === "(") {
      depth++;
      out.add("punct", c);
      i++;
    } else if (c === ")") {
      if (depth > 0) depth--;
      out.add("punct", c);
      i++;
    } else if (c === "," || c === ":" || c === ";" || c === "{" || c === "}") {
      out.add("punct", c);
      i++;
    } else if (c === "!") {
      const e = readCssIdent(s, skipSpace(s, i + 1));
      out.add("keyword", s.slice(i, e));
      i = Math.max(e, i + 1);
    } else if (c === "#") {
      let e = i + 1;
      while (isLetter(s[e]) || isDigit(s[e])) e++;
      out.add(e > i + 1 ? "number" : "punct", s.slice(i, e));
      i = e;
    } else if (
      isDigit(c) ||
      (c === "." && isDigit(s[i + 1])) ||
      ((c === "-" || c === "+") && (isDigit(s[i + 1]) || (s[i + 1] === "." && isDigit(s[i + 2]))))
    ) {
      let e = i + 1;
      while (isDigit(s[e])) e++;
      if (s[e] === "." && isDigit(s[e + 1])) {
        e++;
        while (isDigit(s[e])) e++;
      }
      if (s[e] === "%") e++;
      else while (isLetter(s[e])) e++;
      out.add("number", s.slice(i, e));
      i = e;
    } else if (
      isLetter(c) ||
      c === "_" ||
      c === "\\" ||
      c > "\x7f" ||
      (c === "-" && (isLetter(s[i + 1]) || s[i + 1] === "_" || s[i + 1] === "-"))
    ) {
      const e = readCssIdent(s, i);
      const word = s.slice(i, e);
      if (word.startsWith("--")) {
        out.add("prop", word);
        i = e;
      } else if (s[e] === "(") {
        out.add("fn", word);
        i = e;
        if (word.toLowerCase() === "url") {
          const k = skipSpace(s, e + 1);
          if (s[k] !== '"' && s[k] !== "'") {
            const close = s.indexOf(")", e);
            const stop = close < 0 ? n : close;
            out.add("punct", "(");
            out.add("string", s.slice(e + 1, stop));
            i = stop;
          }
        }
      } else if (prelude && depth > 0 && s[skipSpace(s, e)] === ":") {
        out.add("prop", word);
        i = e;
      } else {
        out.add(prelude && PRELUDE_WORDS.has(word) ? "keyword" : "plain", word);
        i = e;
      }
    } else if ("+-*=<>".includes(c)) {
      out.add("op", c);
      i++;
    } else {
      out.add("plain", c);
      i++;
    }
  }
  return i;
}

function cssDeclaration(s: string, i: number, out: Out): number {
  const n = s.length;
  let j = i;
  while (
    j < n &&
    !":;{}".includes(s[j]!) &&
    !isSpace(s[j]) &&
    !(s[j] === "/" && s[j + 1] === "*")
  ) {
    j++;
  }
  if (j === i) {
    out.add("plain", s[i]!);
    return i + 1;
  }
  out.add("prop", s.slice(i, j));
  // spaces or comments before the colon
  while (j < n && (isSpace(s[j]) || (s[j] === "/" && s[j + 1] === "*"))) {
    j = isSpace(s[j]) ? ws(s, j, out) : cssComment(s, j, out);
  }
  if (s[j] !== ":") return j;
  out.add("punct", ":");
  return cssValue(s, j + 1, out, false);
}

function scanCss(s: string, out: Out): void {
  const n = s.length;
  const memo: Look = { end: -1, kind: ";" };
  let i = 0;
  while (i < n) {
    const c = s[i]!;
    if (isSpace(c)) i = ws(s, i, out);
    else if (c === "/" && s[i + 1] === "*") i = cssComment(s, i, out);
    else if (c === "{" || c === "}" || c === ";") {
      out.add("punct", c);
      i++;
    } else if (c === "@") {
      const e = readCssIdent(s, i + 1);
      out.add("keyword", s.slice(i, e));
      i = cssValue(s, e, out, true);
    } else if (cssLook(s, i, memo) === "{") {
      i = cssSelector(s, i, out);
    } else {
      i = cssDeclaration(s, i, out);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------------------------

const SHELL_KEYWORDS = new Set(
  (
    "if then else elif fi for while until do done case esac in function select time export " +
    "local declare readonly"
  ).split(" "),
);
/** After these a new command can start right away. */
const SHELL_KEEP_COMMAND = new Set(
  "if then else elif while until do time export local declare readonly".split(" "),
);
/** Commands whose first non-flag argument is a subcommand (`npm install`, `git commit`). */
const SUBCOMMANDS = new Set("npm pnpm yarn bun deno git".split(" "));

function scanDoubleQuoted(s: string, i: number): number {
  const n = s.length;
  let j = i + 1;
  while (j < n) {
    if (s[j] === "\\") j += 2;
    else if (s[j] === '"') return j + 1;
    else j++;
  }
  return n;
}

function scanBash(s: string, out: Out): void {
  const n = s.length;
  let i = 0;
  let cmd = true; // the next word is a command
  let sub = false; // the next non-flag word is a subcommand
  let assign = false; // the next word is the value of `NAME=`
  const used = () => {
    if (assign) assign = false;
    else cmd = false;
  };
  while (i < n) {
    const c = s[i]!;
    if (c === "\n") {
      out.add("plain", "\n");
      const cont = s[i - 1] === "\\" || (s[i - 1] === "\r" && s[i - 2] === "\\");
      i++;
      if (!cont) {
        cmd = true;
        sub = false;
        assign = false;
      }
    } else if (isSpace(c)) {
      let j = i + 1;
      while (j < n && s[j] !== "\n" && isSpace(s[j])) j++;
      out.add("plain", s.slice(i, j));
      i = j;
    } else if (c === "#" && (i === 0 || isSpace(s[i - 1]) || ";|&(".includes(s[i - 1]!))) {
      const e = lineEnd(s, i);
      out.add("comment", s.slice(i, e));
      i = e;
    } else if (c === "\\") {
      const next = s[i + 1];
      if (next === undefined || next === "\n" || next === "\r") {
        out.add("punct", "\\");
        i++;
      } else {
        out.add("plain", s.slice(i, i + 2));
        i += 2;
        used();
      }
    } else if (c === "'") {
      const k = s.indexOf("'", i + 1);
      const e = k < 0 ? n : k + 1;
      out.add("string", s.slice(i, e));
      i = e;
      used();
    } else if (c === '"') {
      const e = scanDoubleQuoted(s, i);
      out.add("string", s.slice(i, e));
      i = e;
      used();
    } else if (c === "`") {
      out.add("punct", c);
      i++;
      cmd = true;
      sub = false;
    } else if (c === "$") {
      const next = s[i + 1];
      if (cmd && next === " ") {
        out.add("punct", "$"); // prompt
        i++;
      } else if (next === "(") {
        out.add("punct", "$(");
        i += 2;
        cmd = true;
        sub = false;
      } else if (next === "{") {
        const k = s.indexOf("}", i + 2);
        const e = k < 0 ? n : k + 1;
        out.add("prop", s.slice(i, e));
        i = e;
        used();
      } else {
        let e = i + 1;
        if (isLetter(next) || next === "_") while (isIdPart(s[e]) && s[e] !== "$") e++;
        else if (next !== undefined && "@*#?!$-0123456789".includes(next)) e++;
        out.add(e > i + 1 ? "prop" : "plain", s.slice(i, e));
        i = e;
        used();
      }
    } else if ("|&;".includes(c)) {
      let j = i + 1;
      if (j < n && "|&;".includes(s[j]!) && j - i < 2) j++;
      out.add("op", s.slice(i, j));
      i = j;
      cmd = true;
      sub = false;
      assign = false;
    } else if (c === "<" || c === ">") {
      let j = i + 1;
      while (j < n && (s[j] === "<" || s[j] === ">")) j++;
      if (s[j] === "&" && (isDigit(s[j + 1]) || s[j + 1] === "-")) j += 2;
      out.add("op", s.slice(i, j));
      i = j;
    } else if (c === "(") {
      out.add("punct", c);
      i++;
      cmd = true;
      sub = false;
    } else if (c === ")") {
      out.add("punct", c);
      i++;
      cmd = false;
    } else {
      let j = i;
      while (j < n && !isSpace(s[j]) && !"|&;<>()'\"`$\\".includes(s[j]!)) j++;
      const word = s.slice(i, j);
      i = j;
      let allDigits = true;
      for (let k = 0; k < word.length; k++) if (!isDigit(word[k])) allDigits = false;
      if (allDigits && (s[j] === ">" || s[j] === "<")) {
        out.add("op", word); // the 2 in `2>&1`
        continue;
      }
      if (word.length > 1 && word[0] === "-") {
        const eq = word.indexOf("=");
        if (eq > 0) {
          out.add("attr", word.slice(0, eq));
          out.add("op", "=");
          out.add("plain", word.slice(eq + 1));
        } else {
          out.add("attr", word);
        }
        used();
        continue;
      }
      if (cmd) {
        const eq = word.indexOf("=");
        if (eq > 0 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(word.slice(0, eq))) {
          out.add("prop", word.slice(0, eq));
          out.add("op", "=");
          const rest = word.slice(eq + 1);
          out.add("plain", rest);
          if (!rest) assign = true;
          continue;
        }
        if (SHELL_KEYWORDS.has(word)) {
          out.add("keyword", word);
          cmd = SHELL_KEEP_COMMAND.has(word);
        } else if (word === "!" || word === "{") {
          out.add("punct", word);
        } else if (word === "[" || word === "[[") {
          out.add("punct", word);
          cmd = false;
        } else {
          out.add("fn", word);
          cmd = false;
          sub = SUBCOMMANDS.has(word);
        }
        continue;
      }
      if (word === "]" || word === "]]") {
        out.add("punct", word);
      } else if (sub) {
        out.add("keyword", word);
        sub = false;
      } else {
        out.add(allDigits ? "number" : "plain", word);
      }
      used();
    }
  }
}

// ---------------------------------------------------------------------------------------------
// JSON (comments allowed, as in tsconfig.json)
// ---------------------------------------------------------------------------------------------

function scanJson(s: string, out: Out): void {
  const n = s.length;
  let i = 0;
  while (i < n) {
    const c = s[i]!;
    if (isSpace(c)) {
      i = ws(s, i, out);
    } else if (c === "/" && s[i + 1] === "/") {
      const e = lineEnd(s, i);
      out.add("comment", s.slice(i, e));
      i = e;
    } else if (c === "/" && s[i + 1] === "*") {
      i = cssComment(s, i, out);
    } else if (c === '"') {
      const e = scanQuoted(s, i);
      out.add(s[skipSpace(s, e)] === ":" ? "prop" : "string", s.slice(i, e));
      i = e;
    } else if (isDigit(c) || (c === "-" && isDigit(s[i + 1]))) {
      const e = scanNumber(s, i + (c === "-" ? 1 : 0));
      out.add("number", s.slice(i, e));
      i = e;
    } else if (isLetter(c)) {
      let e = i + 1;
      while (isLetter(s[e])) e++;
      const word = s.slice(i, e);
      out.add(word === "true" || word === "false" || word === "null" ? "keyword" : "plain", word);
      i = e;
    } else if ("{}[],:".includes(c)) {
      out.add("punct", c);
      i++;
    } else {
      out.add("plain", c);
      i++;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------------------------

/** Splits tokens at newlines: one array of tokens per line. Empty lines are empty arrays. */
function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const t of tokens) {
    if (!t.text.includes("\n")) {
      lines[lines.length - 1]!.push(t);
      continue;
    }
    t.text.split("\n").forEach((part, k) => {
      if (k > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ type: t.type, text: part });
    });
  }
  return lines;
}

/**
 * Tokenizes `code` for display. Returns one array of tokens per line; joining every token's text
 * (with "\n" between lines) reproduces `code` exactly.
 */
export function tokenize(code: string, lang: Lang): Token[][] {
  const out = new Out();
  switch (lang) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      scanJs(code, 0, out, {
        jsx: lang === "tsx" || lang === "jsx",
        ts: lang === "ts" || lang === "tsx",
        closer: null,
        level: 0,
      });
      break;
    case "html":
    case "vue":
    case "svelte":
    case "astro":
      scanMarkup(code, out, lang);
      break;
    case "css":
      scanCss(code, out);
      break;
    case "bash":
      scanBash(code, out);
      break;
    case "json":
      scanJson(code, out);
      break;
  }
  return toLines(out.tokens);
}
