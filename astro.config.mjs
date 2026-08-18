// @ts-check
import { defineConfig } from "astro/config";
import validateContentIntegration from "./src/integrations/validate-content.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://www.nicm.dev",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  compressHTML: true,
  integrations: [validateContentIntegration()],
});
