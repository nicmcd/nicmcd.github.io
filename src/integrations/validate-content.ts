/**
 * Astro integration that runs cross-collection content validation on
 * every build, failing the build on any error.
 */

import type { AstroIntegration } from "astro";
import { readContentForValidation } from "../utils/read-content.ts";
import { validateContent } from "../utils/validate.ts";

export default function validateContentIntegration(): AstroIntegration {
  return {
    name: "nicm-content-validation",
    hooks: {
      "astro:build:start": async ({ logger }) => {
        logger.info("Validating content collections...");
        const contentDir = new URL("../content/", import.meta.url).pathname;
        const publicDir = new URL("../../public/", import.meta.url).pathname;
        const errors = validateContent(
          readContentForValidation(contentDir, publicDir),
        );
        if (errors.length > 0) {
          throw new Error(
            `Content validation failed:\n  - ${errors.join("\n  - ")}`,
          );
        }
        logger.info("Content validation passed.");
      },
    },
  };
}
