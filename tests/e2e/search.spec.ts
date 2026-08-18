import { test, expect } from "@playwright/test";

test.describe("search dialog", () => {
  test("opens from the header button and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const dialog = page.locator("[data-search-dialog]");
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: "Open search" }).click();
    await expect(dialog).toBeVisible();
    await expect(page.locator("[data-search-input]")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test('opens with the "/" keyboard shortcut', async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("/");
    await expect(page.locator("[data-search-dialog]")).toBeVisible();
  });

  test("matches by title with highlighted results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();
    await page.locator("[data-search-input]").fill("supersim");

    const results = page.locator(".search-result-link");
    await expect(results.first()).toBeVisible();
    await expect(results.first()).toContainText("SuperSim");
    await expect(results.first().locator("mark").first()).toHaveText(/[Ss]im|SuperSim/);
  });

  test("matches by author and by tag", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();

    await page.locator("[data-search-input]").fill("isaev");
    await expect(page.locator(".search-result-link").first()).toContainText(
      "Calculon: a Methodology and Tool",
    );

    await page.locator("[data-search-input]").fill("Task Management");
    await expect(page.locator(".search-result-link").first()).toContainText("TaskRun");
  });

  test("keyboard navigation: arrows move selection, Enter follows result", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();
    await page.locator("[data-search-input]").fill("networks");

    const options = page.locator(".search-result-link");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowUp");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");

    const selectedHref = await options.first().getAttribute("href");
    await page.keyboard.press("Enter");
    await page.waitForURL(new RegExp(`${selectedHref!.replace(/[/.#]/g, "\\$&")}$`));
  });

  test("shows an empty-results message", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();
    await page.locator("[data-search-input]").fill("zzz-no-such-content-zzz");
    await expect(page.locator("[data-search-empty]")).toBeVisible();
    await expect(page.locator(".search-result-link")).toHaveCount(0);
  });

  test("indexes exactly the profile, five projects, and six publications", async ({ page }) => {
    const response = await page.request.get("/index.json");
    expect(response.ok()).toBe(true);
    const docs = await response.json();
    expect(docs).toHaveLength(12);
    const kinds = docs.map((d: { kind: string }) => d.kind).sort();
    expect(kinds).toEqual([
      "profile",
      "project",
      "project",
      "project",
      "project",
      "project",
      "publication",
      "publication",
      "publication",
      "publication",
      "publication",
      "publication",
    ]);
  });
});
