/**
 * Deterministic weighted substring search over the site index.
 *
 * The same ranking logic powers the browser search dialog and the unit
 * tests. Matching is case-insensitive substring matching; fields are
 * weighted title > tags > authors > summary. Ties break by title for
 * full determinism.
 */

export interface SearchDocument {
  /** Result URL. */
  url: string;
  /** Document kind: "profile" | "project" | "publication". */
  kind: string;
  title: string;
  summary: string;
  tags: string[];
  authors: string[];
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
}

export const FIELD_WEIGHTS = {
  title: 10,
  tags: 5,
  authors: 3,
  summary: 1,
} as const;

/** Count non-overlapping occurrences of `needle` in `haystack` (lowercased inputs). */
function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/** Score a single document against an already-normalized query. */
export function scoreDocument(doc: SearchDocument, normalizedQuery: string): number {
  const q = normalizedQuery;
  let score = 0;
  score += FIELD_WEIGHTS.title * countOccurrences(doc.title.toLowerCase(), q);
  for (const tag of doc.tags) {
    score += FIELD_WEIGHTS.tags * countOccurrences(tag.toLowerCase(), q);
  }
  for (const author of doc.authors) {
    score += FIELD_WEIGHTS.authors * countOccurrences(author.toLowerCase(), q);
  }
  score += FIELD_WEIGHTS.summary * countOccurrences(doc.summary.toLowerCase(), q);
  return score;
}

/** Rank documents for a raw query. Returns only matching documents. */
export function rankDocuments(
  docs: readonly SearchDocument[],
  rawQuery: string,
): SearchResult[] {
  const q = rawQuery.trim().toLowerCase();
  if (q.length === 0) return [];
  const results: SearchResult[] = [];
  for (const doc of docs) {
    const score = scoreDocument(doc, q);
    if (score > 0) results.push({ document: doc, score });
  }
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.document.title.localeCompare(b.document.title);
  });
  return results;
}

/**
 * Split text into highlighted segments for a query. Returns an array of
 * { text, match } parts; concatenating `text` reproduces the input.
 */
export function highlightMatches(
  text: string,
  rawQuery: string,
): { text: string; match: boolean }[] {
  const q = rawQuery.trim().toLowerCase();
  if (q.length === 0) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  let cursor = 0;
  let index = lower.indexOf(q);
  while (index !== -1) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), match: false });
    parts.push({ text: text.slice(index, index + q.length), match: true });
    cursor = index + q.length;
    index = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}
