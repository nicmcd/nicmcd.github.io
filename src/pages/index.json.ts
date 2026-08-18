/**
 * Search index at /index.json.
 *
 * Indexes exactly the primary profile, the five projects, and the three
 * publications with title, summary, tags, and authors.
 */

import type { APIRoute } from "astro";
import {
  getProjectsSorted,
  getPublicationsSorted,
  getPrimaryAuthor,
  authorNames,
  getAuthorsBySlug,
} from "../utils/content.ts";
import type { SearchDocument } from "../utils/search.ts";

export const GET: APIRoute = async () => {
  const [projects, publications, profile, authorsBySlug] = await Promise.all([
    getProjectsSorted(),
    getPublicationsSorted(),
    getPrimaryAuthor(),
    getAuthorsBySlug(),
  ]);

  const documents: SearchDocument[] = [
    {
      url: "/#about",
      kind: "profile",
      title: profile.data.name,
      summary: profile.data.bio ?? "",
      tags: profile.data.interests,
      authors: [profile.data.name],
    },
    ...projects.map((project): SearchDocument => {
      return {
        url: `/project/${project.data.slug}/`,
        kind: "project",
        title: project.data.title,
        summary: project.data.summary,
        tags: project.data.tags,
        authors: [profile.data.name],
      };
    }),
    ...publications.map((pub): SearchDocument => {
      return {
        url: `/publication/${pub.data.slug}/`,
        kind: "publication",
        title: pub.data.title,
        summary: pub.data.summary,
        tags: pub.data.tags,
        authors: authorNames(pub, authorsBySlug).map((a) => a.name),
      };
    }),
  ];

  return new Response(JSON.stringify(documents), {
    headers: { "Content-Type": "application/json" },
  });
};
