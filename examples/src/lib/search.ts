// Matching for the docs search. Pure functions, no DOM, so they run the same on the server and in the browser.
import type { SearchEntry } from "@/types";

/** Most results listed at once. */
export const MAX_RESULTS = 30;

/** Text folded for matching, with the offset in the original text of each folded character. */
export interface Folded {
  text: string;
  map: number[];
}

export interface Prepared {
  entry: SearchEntry;
  title: Folded;
  text: Folded;
  /** Parent title and keywords: searched, never highlighted. */
  extra: string;
}

export interface Hit {
  entry: SearchEntry;
  /** Matched [start, end) ranges in the original title and text. */
  titleRanges: [number, number][];
  textRanges: [number, number][];
}

// Combining marks (Latin accents), Arabic tashkeel (U+064B-065F, U+0670) and tatweel (U+0640).
const DROPPED = /[̀-ًͯ-ٰٟـ]/;
const ALEF = /[أإآٱ]/; // أ إ آ ٱ
const FOLD: Record<string, string> = { ة: "ه", ى: "ي" }; // ة -> ه, ى -> ي

/** Lower-case, accent-free, Arabic-normalised text (alef forms, ة, ى, no tashkeel). */
export function fold(input: string): Folded {
  let text = "";
  const map: number[] = [];
  for (let i = 0; i < input.length; i++) {
    for (const ch of input[i].normalize("NFD").toLowerCase()) {
      if (DROPPED.test(ch)) continue;
      text += ALEF.test(ch) ? "ا" : (FOLD[ch] ?? ch);
      map.push(i);
    }
  }
  return { text, map };
}

export function prepare(entries: SearchEntry[]): Prepared[] {
  return entries.map((entry) => ({
    entry,
    title: fold(entry.title),
    text: fold(entry.text),
    extra: fold(`${entry.parent ?? ""} ${entry.keywords ?? ""}`).text,
  }));
}

/** Folded [start, end) ranges of `term` in `folded`, mapped back to the original text. */
function ranges(folded: Folded, term: string): [number, number][] {
  const found: [number, number][] = [];
  for (
    let at = folded.text.indexOf(term);
    at !== -1;
    at = folded.text.indexOf(term, at + term.length)
  ) {
    found.push([folded.map[at], folded.map[at + term.length - 1] + 1]);
  }
  return found;
}

/** Whether `term` starts a word of `text` (the start of the text counts). */
const startsWord = (text: string, at: number) => at === 0 || /[^\p{L}\p{N}]/u.test(text[at - 1]);

/**
 * Entries that contain every word of `query`, best first: a title that starts with the word, then a title
 * that contains it, then the summary. With no query, the pages themselves.
 */
export function search(items: Prepared[], query: string): Hit[] {
  const terms = fold(query).text.split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return items
      .filter(({ entry }) => !entry.parent)
      .map(({ entry }) => ({ entry, titleRanges: [], textRanges: [] }));
  }
  const scored: { hit: Hit; score: number }[] = [];
  for (const item of items) {
    let score = 0;
    let ok = true;
    for (const term of terms) {
      const inTitle = item.title.text.indexOf(term);
      if (inTitle === 0) score += 100;
      else if (inTitle > 0) score += startsWord(item.title.text, inTitle) ? 80 : 60;
      else if (item.text.text.includes(term)) score += 10;
      else if (item.extra.includes(term)) score += 5;
      else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (!item.entry.parent) score += 15; // a page beats a section of equal match
    scored.push({
      score,
      hit: {
        entry: item.entry,
        titleRanges: terms.flatMap((t) => ranges(item.title, t)),
        textRanges: terms.flatMap((t) => ranges(item.text, t)),
      },
    });
  }
  // Array.prototype.sort is stable: equal scores stay in page order.
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ hit }) => hit);
}

/** Splits `text` into [piece, highlighted] parts for the given (possibly overlapping) ranges. */
export function segments(text: string, found: [number, number][]): [string, boolean][] {
  const sorted = [...found].sort((a, b) => a[0] - b[0]);
  const parts: [string, boolean][] = [];
  let pos = 0;
  for (const [start, end] of sorted) {
    if (end <= pos) continue;
    const from = Math.max(start, pos);
    if (from > pos) parts.push([text.slice(pos, from), false]);
    parts.push([text.slice(from, end), true]);
    pos = end;
  }
  if (pos < text.length) parts.push([text.slice(pos), false]);
  return parts;
}

/** The part of `text` to show: starts a little before the first match so the match is not clipped away. */
export function excerpt(text: string, found: [number, number][]): { text: string; shift: number } {
  const first = found.reduce((min, [start]) => Math.min(min, start), Infinity);
  if (first <= 40) return { text, shift: 0 };
  const from = text.indexOf(" ", first - 30) + 1 || first - 30;
  return { text: "…" + text.slice(from), shift: from - 1 };
}
