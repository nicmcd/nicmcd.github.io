import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Stable reference screenshots: homepage and one publication page, in
 * light and dark themes, at desktop and mobile widths.
 *
 * Screenshots are local, git-ignored artifacts regenerated on demand via
 * `npm run screenshots` (which sets UPDATE_SCREENSHOTS=1). Regular e2e
 * runs skip this spec so they never rewrite the PNGs.
 */

const SHOTS = [
  { path: "/", name: "homepage" },
  { path: "/publication/hxrouting_sc/", name: "publication" },
] as const;

const OUT_DIR = new URL("./screenshots/", import.meta.url).pathname;

test.describe("stable screenshots", () => {
  test.skip(
    !process.env.UPDATE_SCREENSHOTS,
    "screenshot capture only runs via `npm run screenshots`",
  );
  for (const { path, name } of SHOTS) {
    for (const theme of ["light", "dark"] as const) {
      test(`${name} ${theme}`, async ({ page }, testInfo) => {
        const width = testInfo.project.name === "mobile-390" ? "mobile" : "desktop";
        test.skip(
          testInfo.project.name === "tablet-768",
          "screenshots are captured at mobile and desktop widths",
        );

        mkdirSync(OUT_DIR, { recursive: true });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
        await page.goto(path);
        // Deterministic rendering: fonts loaded, images settled.
        await page.evaluate(() => document.fonts.ready);
        await page.waitForLoadState("networkidle");
        await expect(page.locator("main")).toBeVisible();

        await page.screenshot({
          path: `${OUT_DIR}${name}-${width}-${theme}.png`,
          fullPage: true,
        });
      });
    }
  }
});
