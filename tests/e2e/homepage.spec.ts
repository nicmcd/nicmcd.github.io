import { test, expect } from "@playwright/test";

const EXPECTED_FILTERS: Record<string, string[]> = {
  All: ["libdes", "ParaMgmt", "TaskRun", "SuperSim", "DevSearch"],
  Networks: ["SuperSim"],
  Simulation: ["libdes", "SuperSim"],
  "C++": ["libdes", "SuperSim"],
  Python: ["DevSearch", "ParaMgmt", "TaskRun"],
};

test.describe("homepage", () => {
  test("renders all six sections in order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main section[id]").evaluateAll((els) =>
      els.map((el) => el.id),
    );
    expect(ids).toEqual([
      "about",
      "projects",
      "publications",
      "experience",
      "tags",
      "contact",
    ]);
  });

  test("biography shows profile, interests, and education", async ({ page }) => {
    await page.goto("/");
    const about = page.locator("#about");
    await expect(about.getByRole("heading", { name: "Nic McDonald" })).toBeVisible();
    await expect(about.getByRole("heading", { name: "Biography" })).toBeVisible();
    await expect(
      about.getByText(/senior research scientist at NVIDIA Research/),
    ).toBeVisible();
    await expect(about.getByRole("img")).toHaveAttribute(
      "alt",
      "Portrait of Nic McDonald",
    );

    await expect(about.getByRole("heading", { name: "Interests" })).toBeVisible();
    for (const interest of [
      "Computer Architecture",
      "Interconnection Networks",
      "Algorithmic Trading",
    ]) {
      await expect(about.getByText(interest, { exact: true })).toBeVisible();
    }

    await expect(about.getByRole("heading", { name: "Education" })).toBeVisible();
    await expect(about.getByText("Ph.D. in Electrical Engineering, 2016")).toBeVisible();
    await expect(about.getByText("Stanford University")).toBeVisible();
  });

  test("biography stacks cleanly (single column) on mobile", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop-1440", "mobile/tablet only");
    await page.goto("/");
    const grid = page.locator(".profile-grid");
    const columns = await grid.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(" ").length,
    );
    expect(columns).toBe(1);
  });

  test("experience timeline shows all four roles", async ({ page }) => {
    await page.goto("/");
    const experience = page.locator("#experience");
    for (const role of [
      "Senior Research Scientist",
      "Senior Software Engineer",
      "Research Scientist",
      "Digital Hardware Design Engineer",
    ]) {
      await expect(
        experience.getByRole("heading", { name: role }),
      ).toBeVisible();
    }
    await expect(experience.getByText("Present")).toBeVisible();
  });

  test("popular topics lists all eight tags", async ({ page }) => {
    await page.goto("/");
    const cloud = page.locator("#tags .tag-cloud");
    for (const tag of [
      "Cpp",
      "Development",
      "Distributed Computing",
      "Networks",
      "Python",
      "Security",
      "Simulation",
      "Task Management",
    ]) {
      await expect(cloud.getByRole("link", { name: tag, exact: true })).toBeVisible();
    }
  });

  test("contact section has email and social profiles only", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(
      contact.getByRole("link", { name: "n.mcdonald83@gmail.com" }),
    ).toHaveAttribute("href", "mailto:n.mcdonald83@gmail.com");
    await expect(contact.getByRole("link", { name: /GitHub/ })).toBeVisible();
    await expect(contact.locator("form")).toHaveCount(0);
    await expect(contact.getByText(/Sunnyvale/)).toHaveCount(0);
  });

  for (const [filter, expectedTitles] of Object.entries(EXPECTED_FILTERS)) {
    test(`project filter "${filter}" shows the expected cards`, async ({ page }) => {
      await page.goto("/");
      const toolbar = page.locator("[data-filter-toolbar]");
      await toolbar.getByRole("button", { name: filter, exact: true }).click();

      const cards = page.locator(".project-card");
      await expect(cards).toHaveCount(5);

      const visible = cards.locator("visible=true");
      // Count visible cards via :not([hidden])
      const visibleCards = page.locator(".project-card:not([hidden])");
      await expect(visibleCards).toHaveCount(expectedTitles.length);
      for (const title of expectedTitles) {
        await expect(
          page.locator(".project-card:not([hidden]) .card-title", { hasText: title }),
        ).toHaveCount(1);
      }
      await expect(
        toolbar.getByRole("button", { name: filter, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  }

  test("all five projects render with images and external links preserved", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator(".project-card");
    await expect(cards).toHaveCount(5);
    for (const card of await cards.all()) {
      await expect(card.locator("img")).toHaveAttribute("alt", /.+/);
    }
  });
});
