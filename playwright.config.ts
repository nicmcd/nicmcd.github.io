import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright smoke tests run against a production build served by
 * `astro preview`. Build first with `npm run build` (the webServer
 * command below builds when dist is missing).
 */

/**
 * Dedicated e2e port so the test server never collides with a local
 * `astro dev` / `astro preview` server (default port 4321).
 */
const E2E_PORT = 4421;
const E2E_URL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: E2E_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "tablet-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // `astro preview` daemonizes in Astro 7, so a foreground wrapper keeps
    // the process alive for Playwright and stops the daemon on shutdown.
    command: `npm run build && PORT=${E2E_PORT} node --experimental-strip-types scripts/preview-foreground.ts`,
    url: E2E_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
