/**
 * Build-time content validation.
 *
 * Validates cross-collection references, slug uniqueness, internal asset
 * paths, date sanity, and required image alt text (non-empty and free of
 * redundant words like "image", "photo", or "picture", matching the Astro
 * dev toolbar audit rule a11y-img-redundant-alt). Exercised by unit
 * tests and by `npm run validate` (scripts/validate-content.ts).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Words screen readers already announce for images; redundant in alt text.
 * Mirrors the Astro dev toolbar audit rule a11y-img-redundant-alt.
 */
const REDUNDANT_ALT_WORDS = /\b(?:image|picture|photo)\b/i;

export interface ValidationAuthor {
  slug: string;
  primary: boolean;
  avatarAlt?: string | undefined;
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

export interface ValidationPatent {
  id: string;
  title: string;
  patentNumber: string;
  date: Date;
}

export interface ValidationInput {
  authors: ValidationAuthor[];
  projects: ValidationProject[];
  publications: ValidationPublication[];
  experience: ValidationExperience[];
  patents: ValidationPatent[];
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
  checkUniqueSlugs("patents", input.patents.map((p) => p.id), errors);
  checkUniqueSlugs(
    "patents",
    input.patents.map((p) => p.patentNumber),
    errors,
  );

  const authorSlugs = new Set(input.authors.map((a) => a.slug));
  const projectSlugs = new Set(input.projects.map((p) => p.slug));
  const publicationSlugs = new Set(input.publications.map((p) => p.slug));

  const primaryCount = input.authors.filter((a) => a.primary).length;
  if (primaryCount !== 1) {
    errors.push(`authors: expected exactly 1 primary author, found ${primaryCount}`);
  }

  for (const author of input.authors) {
    if (author.avatarAlt !== undefined && REDUNDANT_ALT_WORDS.test(author.avatarAlt)) {
      errors.push(
        `author "${author.slug}": avatar alt text contains redundant word (image, picture, photo)`,
      );
    }
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
    if (REDUNDANT_ALT_WORDS.test(pub.imageAlt)) {
      errors.push(
        `publication "${pub.slug}": image alt text contains redundant word (image, picture, photo)`,
      );
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
    if (REDUNDANT_ALT_WORDS.test(project.imageAlt)) {
      errors.push(
        `project "${project.slug}": image alt text contains redundant word (image, picture, photo)`,
      );
    }
  }

  for (const item of input.experience) {
    if (item.dateEnd !== undefined && item.dateEnd < item.dateStart) {
      errors.push(`experience "${item.title}": end date precedes start date`);
    }
  }

  for (const patent of input.patents) {
    if (Number.isNaN(patent.date.getTime())) {
      errors.push(`patent "${patent.title}": invalid date`);
    }
  }

  return errors;
}
