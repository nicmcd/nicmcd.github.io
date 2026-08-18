import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test("desktop nav shows all links and navigates by anchor", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#site-nav");
    await expect(nav).toBeVisible();

    for (const name of ["Home", "Projects", "Publications", "Experience", "Contact", "CV"]) {
      await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
    }

    await nav.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator("#projects")).toBeInViewport();
  });

  test("CV link points at the preserved PDF", async ({ page }) => {
    await page.goto("/");
    const cv = page.locator("#site-nav").getByRole("link", { name: "CV" });
    await expect(cv).toHaveAttribute("href", "/pubs/nicmcdonald_cv.pdf");
  });

  test("mobile menu is an accessible disclosure", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop-1440", "mobile/tablet only");
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Toggle navigation" });
    const nav = page.locator("#site-nav");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(nav).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(nav).toBeVisible();

    // Choosing a destination closes the menu.
    await nav.getByRole("link", { name: "Publications" }).click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(/#publications$/);
  });

  test("scrollspy marks the active section", async ({ page }) => {
    await page.goto("/");
    await page.locator("#experience").evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    await expect(
      page.locator('.nav-link[data-section="experience"]'),
    ).toHaveAttribute("aria-current", "true", { timeout: 5000 });
    await expect(
      page.locator('.nav-link[data-section="projects"]'),
    ).not.toHaveAttribute("aria-current", "true");
  });

  test("skip link targets main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(page.locator("#main-content")).toBeAttached();
  });
});
