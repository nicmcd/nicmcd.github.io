import { test, expect } from "@playwright/test";

test.describe("patents section", () => {
  test("renders all 22 patents in date order with metadata", async ({ page }) => {
    await page.goto("/");
    const patents = page.locator("#patents");
    await expect(
      patents.getByRole("heading", { name: "Patents", exact: true }),
    ).toBeVisible();

    const items = patents.locator(".patent-item");
    await expect(items).toHaveCount(22);

    // Newest first, oldest last (date descending).
    await expect(
      items.first().getByRole("link", { name: /Rate update engine/ }),
    ).toBeVisible();
    await expect(
      items.last().getByRole("link", { name: /Arbitrating data packets/ }),
    ).toBeVisible();

    // Every entry shows a status tag, patent number, date, and assignee.
    for (const item of await items.all()) {
      await expect(item.locator(".tag")).toHaveText(/Granted|Pending/);
      await expect(item.locator(".patent-meta")).toContainText(/US\d+[A-Z]\d/);
      await expect(item.locator(".patent-meta")).toContainText(
        /Hewlett Packard Enterprise|Google/,
      );
    }
  });

  test("patent links open Google Patents in a new tab", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("#patents .patent-title a");
    await expect(links).toHaveCount(22);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute(
        "href",
        /^https:\/\/patents\.google\.com\/patent\/US\d+[A-Z]\d\/en$/,
      );
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("aria-label", /\(external link\)$/);
    }
  });

  test("pending applications are marked distinctly from granted patents", async ({ page }) => {
    await page.goto("/");
    const patents = page.locator("#patents");
    const pending = patents.locator(".patent-item", { hasText: "Pending" });
    await expect(pending).toHaveCount(2);
    await expect(pending.first()).toContainText("A1");
    const granted = patents.locator(".patent-item", { hasText: "Granted" });
    await expect(granted).toHaveCount(20);
    await expect(granted.first()).toContainText("B2");
  });
});
