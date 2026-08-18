/**
 * Tag normalization and publication-type labels.
 *
 * Display tags (e.g. "Cpp", "Distributed Computing") map to stable URL
 * slugs (e.g. "cpp", "distributed-computing") that match the legacy site.
 */

/** Convert a display tag to its canonical URL slug. */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\+\+/g, "pp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Human-readable labels for the Hugo Academic publication-type legend. */
export const publicationTypeLabels: Readonly<Record<string, string>> = {
  "0": "Uncategorized",
  "1": "Conference paper",
  "2": "Journal article",
  "3": "Preprint / Working Paper",
  "4": "Report",
  "5": "Book",
  "6": "Book section",
  "7": "Thesis",
  "8": "Patent",
};

export function publicationTypeLabel(type: string): string {
  const label = publicationTypeLabels[type];
  if (label === undefined) {
    throw new Error(`Unknown publication type: ${type}`);
  }
  return label;
}
