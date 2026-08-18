import { test, expect } from "@playwright/test";

test.describe("theme", () => {
  test("initializes from prefers-color-scheme", async ({ browser }) => {
    for (const scheme of ["light", "dark"] as const) {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      await context.close();
    }
  });

  test("toggle switches theme and exposes the action in its label", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Switch to .* theme/ });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-label", "Switch to dark theme");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-label", "Switch to light theme");
  });

  test("persists the explicit choice across loads", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: /Switch to .* theme/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Even a fresh navigation within the same context keeps the choice.
    await page.goto("/publication/hxrouting_sc/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("explicit choice wins over prefers-color-scheme", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await context.close();
  });

  test("reduced-motion disables smooth scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const behavior = await page.evaluate(() =>
      getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe("auto");
  });

  test("theme toggle is keyboard accessible", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Switch to .* theme/ });
    await toggle.focus();
    const before = await page.locator("html").getAttribute("data-theme");
    await page.keyboard.press("Enter");
    const after = await page.locator("html").getAttribute("data-theme");
    expect(before).not.toBe(after);
  });
});
