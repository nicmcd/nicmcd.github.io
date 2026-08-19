/**
 * Search index at /index.json.
 *
 * Indexes the primary profile, the projects, the publications, and the
 * patents with title, summary, tags, and authors.
 */

import type { APIRoute } from "astro";
import {
  getProjectsSorted,
  getPublicationsSorted,
  getPrimaryAuthor,
  getPatentsSorted,
  authorNames,
  getAuthorsBySlug,
} from "../utils/content.ts";
import type { SearchDocument } from "../utils/search.ts";

export const GET: APIRoute = async () => {
  const [projects, publications, profile, authorsBySlug, patents] =
    await Promise.all([
      getProjectsSorted(),
      getPublicationsSorted(),
      getPrimaryAuthor(),
      getAuthorsBySlug(),
      getPatentsSorted(),
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
    ...patents.map((patent): SearchDocument => {
      return {
        url: "/#patents",
        kind: "patent",
        title: patent.data.title,
        summary:
          `${patent.data.patentNumber} · ` +
          `${patent.data.status === "granted" ? "Granted" : "Pending"} · ` +
          patent.data.assignee,
        tags: [],
        authors: [profile.data.name],
      };
    }),
  ];

  return new Response(JSON.stringify(documents), {
    headers: { "Content-Type": "application/json" },
  });
};
