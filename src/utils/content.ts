/**
 * Shared content access helpers: sorted collections, author lookup, and
 * tag aggregation used across pages, feeds, and the search index.
 */

import { getCollection, type CollectionEntry } from "astro:content";
import { tagSlug } from "./tags.ts";

export type Project = CollectionEntry<"projects">;
export type Publication = CollectionEntry<"publications">;
export type Author = CollectionEntry<"authors">;
export type Experience = CollectionEntry<"experience">;
export type Patent = CollectionEntry<"patents">;

/** Projects ordered by date descending (matches the legacy homepage). */
export async function getProjectsSorted(): Promise<Project[]> {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Publications ordered by date descending. */
export async function getPublicationsSorted(): Promise<Publication[]> {
  const publications = await getCollection("publications");
  return publications.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Authors keyed by slug. */
export async function getAuthorsBySlug(): Promise<Map<string, Author>> {
  const authors = await getCollection("authors");
  return new Map(authors.map((a) => [a.data.slug, a]));
}

/** The single primary (superuser) author. */
export async function getPrimaryAuthor(): Promise<Author> {
  const authors = await getCollection("authors");
  const primary = authors.find((a) => a.data.primary);
  if (primary === undefined) throw new Error("No primary author defined");
  return primary;
}

/** Experience items in explicit display order. */
export async function getExperienceSorted(): Promise<Experience[]> {
  const items = await getCollection("experience");
  return items.sort((a, b) => a.data.order - b.data.order);
}

/** Patents ordered by date descending. */
export async function getPatentsSorted(): Promise<Patent[]> {
  const patents = await getCollection("patents");
  return patents.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export interface TagInfo {
  /** Display form, e.g. "Distributed Computing". */
  name: string;
  /** URL slug, e.g. "distributed-computing". */
  slug: string;
  /** Number of projects + publications carrying this tag. */
  count: number;
}

/** All tags across projects and publications, alphabetical (legacy cloud order). */
export function aggregateTags(
  projects: readonly Project[],
  publications: readonly Publication[],
): TagInfo[] {
  const byName = new Map<string, TagInfo>();
  const add = (name: string): void => {
    const existing = byName.get(name);
    if (existing !== undefined) {
      existing.count += 1;
    } else {
      byName.set(name, { name, slug: tagSlug(name), count: 1 });
    }
  };
  for (const project of projects) project.data.tags.forEach(add);
  for (const publication of publications) publication.data.tags.forEach(add);
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Resolve a publication's author slugs to display names. */
export function authorNames(
  publication: Publication,
  authorsBySlug: Map<string, Author>,
): { slug: string; name: string }[] {
  return publication.data.authors.map((slug) => {
    const author = authorsBySlug.get(slug);
    if (author === undefined) throw new Error(`Unknown author: ${slug}`);
    return { slug, name: author.data.name };
  });
}
