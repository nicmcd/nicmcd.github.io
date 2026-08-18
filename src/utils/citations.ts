/**
 * Citation (BibTeX) loading.
 *
 * Canonical `.bib` files live under `public/publication/{slug}/cite.bib`
 * so they are served verbatim at their legacy URLs. The same files are
 * read at build time to populate citation dialogs.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Load the verbatim BibTeX for a publication given its bibPath (e.g. "publication/hpsoc_thesis/cite.bib"). */
export function loadBibtex(bibPath: string): string {
  const fullPath = join(process.cwd(), "public", bibPath);
  return readFileSync(fullPath, "utf8");
}
