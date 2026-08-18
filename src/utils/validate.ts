/**
 * Build-time content validation.
 *
 * Validates cross-collection references, slug uniqueness, internal asset
 * paths, date sanity, and required image alt text. Exercised by unit
 * tests and by `npm run validate` (scripts/validate-content.ts).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

export interface ValidationAuthor {
  slug: string;
  primary: boolean;
}

export interface ValidationProject {
  slug: string;
  imageAlt: string;
  relatedPublications: string[];
}

export interface ValidationPublication {
  slug: string;
  authors: string[];
  projects: string[];
  imageAlt: string;
  pdf: string;
  slides: string | undefined;
  poster: string | undefined;
  bibPath: string;
}

export interface ValidationExperience {
  title: string;
  dateStart: Date;
  dateEnd: Date | undefined;
}

export interface ValidationInput {
  authors: ValidationAuthor[];
  projects: ValidationProject[];
  publications: ValidationPublication[];
  experience: ValidationExperience[];
  /** Directory that internal asset paths are resolved against (public/). */
  publicDir: string;
}

function checkUniqueSlugs(
  collection: string,
  slugs: readonly string[],
  errors: string[],
): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      errors.push(`${collection}: duplicate slug "${slug}"`);
    }
    seen.add(slug);
  }
}

/** Collect validation errors. Returns an empty array when content is valid. */
export function validateContent(input: ValidationInput): string[] {
  const errors: string[] = [];

  checkUniqueSlugs("authors", input.authors.map((a) => a.slug), errors);
  checkUniqueSlugs("projects", input.projects.map((p) => p.slug), errors);
  checkUniqueSlugs("publications", input.publications.map((p) => p.slug), errors);

  const authorSlugs = new Set(input.authors.map((a) => a.slug));
  const projectSlugs = new Set(input.projects.map((p) => p.slug));
  const publicationSlugs = new Set(input.publications.map((p) => p.slug));

  const primaryCount = input.authors.filter((a) => a.primary).length;
  if (primaryCount !== 1) {
    errors.push(`authors: expected exactly 1 primary author, found ${primaryCount}`);
  }

  for (const pub of input.publications) {
    for (const author of pub.authors) {
      if (!authorSlugs.has(author)) {
        errors.push(`publication "${pub.slug}": unknown author "${author}"`);
      }
    }
    for (const project of pub.projects) {
      if (!projectSlugs.has(project)) {
        errors.push(`publication "${pub.slug}": unknown project "${project}"`);
      }
    }
    if (pub.imageAlt.trim().length === 0) {
      errors.push(`publication "${pub.slug}": missing image alt text`);
    }
    for (const asset of [pub.pdf, pub.slides, pub.poster, pub.bibPath]) {
      if (asset !== undefined && !existsSync(join(input.publicDir, asset))) {
        errors.push(`publication "${pub.slug}": missing asset "${asset}"`);
      }
    }
  }

  for (const project of input.projects) {
    for (const pub of project.relatedPublications) {
      if (!publicationSlugs.has(pub)) {
        errors.push(`project "${project.slug}": unknown publication "${pub}"`);
      }
    }
    if (project.imageAlt.trim().length === 0) {
      errors.push(`project "${project.slug}": missing image alt text`);
    }
  }

  for (const item of input.experience) {
    if (item.dateEnd !== undefined && item.dateEnd < item.dateStart) {
      errors.push(`experience "${item.title}": end date precedes start date`);
    }
  }

  return errors;
}
