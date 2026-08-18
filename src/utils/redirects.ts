/**
 * Legacy URL compatibility mapping.
 *
 * The generated Hugo site exposed URLs that are obsolete in the Astro
 * rebuild. Each entry produces a lightweight no-index page with a
 * canonical link, an immediate meta refresh, a `location.replace` script,
 * and a visible fallback link.
 */

export interface LegacyRedirect {
  /** Legacy absolute path (trailing slash, no domain). */
  from: string;
  /** Canonical destination path. */
  to: string;
}

/**
 * Build the full redirect table. Tag slugs are supplied so every legacy
 * `/tags/{tag}/page/1/` pagination alias is covered.
 */
export function legacyRedirects(tagSlugs: readonly string[]): LegacyRedirect[] {
  const redirects: LegacyRedirect[] = [
    // Stale duplicate publication slug.
    { from: "/publication/incadr_sc/", to: "/publication/hxrouting_sc/" },
    // Obsolete categories taxonomy folds into tags.
    { from: "/categories/", to: "/tags/" },
    { from: "/categories/page/1/", to: "/tags/" },
    // Section pagination aliases.
    { from: "/authors/page/1/", to: "/authors/" },
    { from: "/project/page/1/", to: "/project/" },
    { from: "/publication_types/page/1/", to: "/publication_types/" },
    { from: "/publication_types/1/page/1/", to: "/publication_types/1/" },
    { from: "/publication_types/7/page/1/", to: "/publication_types/7/" },
    { from: "/tags/page/1/", to: "/tags/" },
  ];
  for (const slug of tagSlugs) {
    redirects.push({ from: `/tags/${slug}/page/1/`, to: `/tags/${slug}/` });
  }
  return redirects;
}
