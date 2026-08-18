import { test, expect } from "@playwright/test";

test.describe("no-JavaScript rendering", () => {
  test("all essential homepage content is visible without JavaScript", async ({ browser }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");

    // Profile
    await expect(page.getByRole("heading", { name: "Biography" })).toBeVisible();
    await expect(page.getByText(/senior research scientist at NVIDIA/)).toBeVisible();

    // All six projects remain visible (no hidden-until-JS containers).
    const cards = page.locator(".project-card");
    await expect(cards).toHaveCount(6);
    for (const card of await cards.all()) {
      await expect(card).toBeVisible();
    }

    // Publications, experience, topics, contact
    await expect(
      page.getByRole("link", { name: /Practical and Efficient Incremental/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Senior Research Scientist" }),
    ).toBeVisible();
    await expect(page.locator("#tags .tag-cloud a").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "n.mcdonald83@gmail.com" }),
    ).toBeVisible();

    // Navigation is visible without JS at desktop width (on smaller
    // viewports the nav lives behind the JS-driven disclosure toggle).
    if (testInfo.project.name === "desktop-1440") {
      await expect(page.locator("#site-nav")).toBeVisible();
    }

    await context.close();
  });

  test("publication detail pages render fully without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/publication/hxrouting_sc/");
    await expect(page.getByRole("heading", { name: "Abstract" })).toBeVisible();
    await expect(page.getByRole("link", { name: "PDF", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /DOI/ }).first()).toBeVisible();
    // BibTeX is embedded at build time; the dialog markup exists without JS.
    await expect(page.locator("#cite-hxrouting_sc [data-cite-content]")).toContainText(
      "@inproceedings",
    );
    await context.close();
  });
});
