/**
 * File-based content reader for validation outside the Vite pipeline
 * (standalone script and Astro integration hooks, both plain Node).
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { ValidationInput } from "./validate.ts";

/** Parse the YAML frontmatter of a markdown file. */
function frontmatter(filePath: string): Record<string, unknown> {
  const raw = readFileSync(filePath, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  const yamlBlock = match?.[1];
  if (yamlBlock === undefined) {
    throw new Error(`Missing frontmatter: ${filePath}`);
  }
  return parseYaml(yamlBlock) as Record<string, unknown>;
}

/** List entry files for a glob-based collection (index.md in subdirs or plain .md files). */
function entryFiles(contentDir: string, collection: string): string[] {
  const dir = join(contentDir, collection);
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const entryPath = join(dir, entry);
    if (statSync(entryPath).isDirectory()) {
      const indexPath = join(entryPath, "index.md");
      if (existsSync(indexPath)) files.push(indexPath);
    } else if (entry.endsWith(".md")) {
      files.push(entryPath);
    }
  }
  return files;
}

const toDate = (value: unknown): Date | undefined =>
  value === undefined || value === null || value === ""
    ? undefined
    : new Date(value as string);

/** Read all collections into the shape required by validateContent. */
export function readContentForValidation(
  contentDir: string,
  publicDir: string,
): ValidationInput {
  const authors = entryFiles(contentDir, "authors").map((f) => frontmatter(f));
  const projects = entryFiles(contentDir, "projects").map((f) => frontmatter(f));
  const publications = entryFiles(contentDir, "publications").map((f) =>
    frontmatter(f),
  );
  const experience = parseYaml(
    readFileSync(join(contentDir, "experience.yaml"), "utf8"),
  ) as Record<string, unknown>[];
  const patents = parseYaml(
    readFileSync(join(contentDir, "patents.yaml"), "utf8"),
  ) as Record<string, unknown>[];

  return {
    authors: authors.map((a) => ({
      slug: String(a.slug),
      primary: a.primary === true,
      avatarAlt: a.avatarAlt === undefined ? undefined : String(a.avatarAlt),
    })),
    projects: projects.map((p) => ({
      slug: String(p.slug),
      imageAlt: String(p.imageAlt ?? ""),
      relatedPublications: (p.relatedPublications as string[] | undefined) ?? [],
    })),
    publications: publications.map((p) => ({
      slug: String(p.slug),
      authors: (p.authors as string[] | undefined) ?? [],
      projects: (p.projects as string[] | undefined) ?? [],
      imageAlt: String(p.imageAlt ?? ""),
      pdf: String(p.pdf ?? ""),
      slides: p.slides === undefined ? undefined : String(p.slides),
      poster: p.poster === undefined ? undefined : String(p.poster),
      bibPath: String(p.bibPath ?? ""),
    })),
    experience: experience.map((e) => ({
      title: String(e.title),
      dateStart: toDate(e.dateStart) ?? new Date(Number.NaN),
      dateEnd: toDate(e.dateEnd),
    })),
    patents: patents.map((p) => ({
      id: String(p.id),
      title: String(p.title),
      patentNumber: String(p.patentNumber),
      date: toDate(p.date) ?? new Date(Number.NaN),
    })),
    publicDir,
  };
}
