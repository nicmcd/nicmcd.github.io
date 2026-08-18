/**
 * Shared RSS item builders so every feed uses consistent item shapes.
 */

import type { RSSFeedItem } from "@astrojs/rss";
import type { Project, Publication, Author } from "./content.ts";

export function publicationFeedItems(
  publications: readonly Publication[],
): RSSFeedItem[] {
  return publications.map((pub) => ({
    title: pub.data.title,
    link: `/publication/${pub.data.slug}/`,
    description: pub.data.summary,
    pubDate: pub.data.date,
  }));
}

export function projectFeedItems(projects: readonly Project[]): RSSFeedItem[] {
  return projects.map((project) => ({
    title: project.data.title,
    link: `/project/${project.data.slug}/`,
    description: project.data.summary,
    pubDate: project.data.date,
  }));
}

export function profileFeedItem(author: Author): RSSFeedItem {
  return {
    title: author.data.name,
    link: `/authors/${author.data.slug}/`,
    description: author.data.bio ?? author.data.name,
  };
}
