/**
 * Content validation entry point (`npm run validate`).
 *
 * Reads collection frontmatter directly from src/content and runs the
 * cross-collection validation rules in src/utils/validate.ts. The same
 * rules also run inside every `astro build` via the local integration in
 * astro.config.mjs. Exits non-zero when any rule fails.
 */

import { readContentForValidation } from "../src/utils/read-content.ts";
import { validateContent } from "../src/utils/validate.ts";

const contentDir = new URL("../src/content/", import.meta.url).pathname;
const publicDir = new URL("../public/", import.meta.url).pathname;

const input = readContentForValidation(contentDir, publicDir);
const errors = validateContent(input);

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Content validation passed: ${input.authors.length} authors, ` +
    `${input.projects.length} projects, ${input.publications.length} publications, ` +
    `${input.experience.length} experience items.`,
);
