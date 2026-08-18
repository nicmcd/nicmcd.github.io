/**
 * Sitemap at /sitemap.xml covering all canonical routes.
 * (Redirect/compatibility pages and 404 are intentionally excluded.)
 */

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../site.config.ts";
import {
  getProjectsSorted,
  getPublicationsSorted,
  aggregateTags,
} from "../utils/content.ts";

function urlEntry(loc: string, lastmod?: string): string {
  const lastmodTag = lastmod !== undefined ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
}

export const GET: APIRoute = async () => {
  const [projects, publications, authors] = await Promise.all([
    getProjectsSorted(),
    getPublicationsSorted(),
    getCollection("authors"),
  ]);
  const tags = aggregateTags(projects, publications);
  const types = [...new Set(publications.map((p) => p.data.type))].sort();

  const paths: string[] = [
    "/",
    "/project/",
    ...projects.map((p) => `/project/${p.data.slug}/`),
    "/publication/",
    ...publications.map((p) => `/publication/${p.data.slug}/`),
    "/tags/",
    ...tags.map((t) => `/tags/${t.slug}/`),
    "/authors/",
    ...authors.map((a) => `/authors/${a.data.slug}/`),
    "/publication_types/",
    ...types.map((t) => `/publication_types/${t}/`),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => urlEntry(`${site.url}${p}`)).join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
};
