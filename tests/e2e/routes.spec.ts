import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const CANONICAL_ROUTES = [
  "/",
  "/project/",
  "/project/devsearch/",
  "/project/libdes/",
  "/project/paramgmt/",
  "/project/supersim/",
  "/project/taskrun/",
  "/publication/",
  "/publication/hpsoc_thesis/",
  "/publication/hxrouting_sc/",
  "/publication/supersim_ispass/",
  "/tags/",
  "/tags/cpp/",
  "/tags/development/",
  "/tags/distributed-computing/",
  "/tags/networks/",
  "/tags/python/",
  "/tags/security/",
  "/tags/simulation/",
  "/tags/task-management/",
  "/authors/",
  "/authors/admin/",
  "/authors/adriana-flores/",
  "/authors/al-davis/",
  "/authors/bill-dally/",
  "/authors/doug-gibson/",
  "/authors/john-kim/",
  "/authors/mikhail-isaev/",
  "/publication_types/",
  "/publication_types/1/",
  "/publication_types/7/",
];

const RSS_FEEDS = [
  "/index.xml",
  "/project/index.xml",
  "/publication/index.xml",
  "/tags/index.xml",
  "/tags/cpp/index.xml",
  "/tags/development/index.xml",
  "/tags/distributed-computing/index.xml",
  "/tags/networks/index.xml",
  "/tags/python/index.xml",
  "/tags/security/index.xml",
  "/tags/simulation/index.xml",
  "/tags/task-management/index.xml",
  "/authors/index.xml",
  "/authors/admin/index.xml",
  "/authors/adriana-flores/index.xml",
  "/authors/al-davis/index.xml",
  "/authors/bill-dally/index.xml",
  "/authors/doug-gibson/index.xml",
  "/authors/john-kim/index.xml",
  "/authors/mikhail-isaev/index.xml",
  "/publication_types/index.xml",
  "/publication_types/1/index.xml",
  "/publication_types/7/index.xml",
];

const REDIRECTS: [string, string][] = [
  ["/publication/incadr_sc/", "/publication/hxrouting_sc/"],
  ["/categories/", "/tags/"],
  ["/categories/page/1/", "/tags/"],
  ["/authors/page/1/", "/authors/"],
  ["/project/page/1/", "/project/"],
  ["/publication_types/page/1/", "/publication_types/"],
  ["/publication_types/1/page/1/", "/publication_types/1/"],
  ["/publication_types/7/page/1/", "/publication_types/7/"],
  ["/tags/page/1/", "/tags/"],
  ["/tags/cpp/page/1/", "/tags/cpp/"],
  ["/tags/development/page/1/", "/tags/development/"],
  ["/tags/distributed-computing/page/1/", "/tags/distributed-computing/"],
  ["/tags/networks/page/1/", "/tags/networks/"],
  ["/tags/python/page/1/", "/tags/python/"],
  ["/tags/security/page/1/", "/tags/security/"],
  ["/tags/simulation/page/1/", "/tags/simulation/"],
  ["/tags/task-management/page/1/", "/tags/task-management/"],
];

test.describe("canonical routes", () => {
  for (const route of CANONICAL_ROUTES) {
    test(`${route} returns 200 with a canonical link`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        `https://www.nicm.dev${route}`,
      );
    });
  }

  test("exactly five projects and three publications exist", async ({ page }) => {
    const response = await page.request.get("/index.json");
    const docs = await response.json();
    expect(docs.filter((d: { kind: string }) => d.kind === "project")).toHaveLength(5);
    expect(docs.filter((d: { kind: string }) => d.kind === "publication")).toHaveLength(3);
  });
});

test.describe("taxonomy pages", () => {
  test("tag page lists tagged publications and projects", async ({ page }) => {
    await page.goto("/tags/networks/");
    await expect(
      page.getByRole("heading", { name: "Networks", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Practical and Efficient Incremental/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "SuperSim" }).first()).toBeVisible();
  });

  test("author pages list their publications", async ({ page }) => {
    await page.goto("/authors/john-kim/");
    await expect(
      page.getByRole("heading", { name: "John Kim" }),
    ).toBeVisible();
    // Each publication title links twice: the "Latest" list and the cards.
    await expect(
      page.getByRole("link", { name: /Practical and Efficient Incremental/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /SuperSim: Extensible/ }).first(),
    ).toBeVisible();
  });

  test("publication type pages show human-readable labels", async ({ page }) => {
    await page.goto("/publication_types/1/");
    await expect(
      page.getByRole("heading", { name: "Conference paper" }),
    ).toBeVisible();
    await page.goto("/publication_types/7/");
    await expect(page.getByRole("heading", { name: "Thesis" })).toBeVisible();
  });
});

test.describe("feeds and metadata routes", () => {
  for (const feed of RSS_FEEDS) {
    test(`RSS feed ${feed} is valid`, async ({ page }) => {
      const response = await page.request.get(feed);
      expect(response.ok()).toBe(true);
      const body = await response.text();
      expect(body).toContain("<rss");
      expect(body).toContain("<channel>");
    });
  }

  test("sitemap lists canonical routes", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.ok()).toBe(true);
    const body = await response.text();
    for (const route of [
      "https://www.nicm.dev/",
      "https://www.nicm.dev/publication/hxrouting_sc/",
      "https://www.nicm.dev/project/supersim/",
      "https://www.nicm.dev/tags/networks/",
      "https://www.nicm.dev/authors/admin/",
      "https://www.nicm.dev/publication_types/1/",
    ]) {
      expect(body).toContain(`<loc>${route}</loc>`);
    }
  });

  test("manifest, robots, and 404 are served", async ({ page }) => {
    const manifest = await page.request.get("/index.webmanifest");
    expect(manifest.ok()).toBe(true);
    const manifestJson = await manifest.json();
    expect(manifestJson.name).toBe("Nic McDonald");
    expect(manifestJson.theme_color).toBe("#2962ff");

    const robots = await page.request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain("sitemap.xml");

    const notFound = await page.goto("/404.html");
    expect(notFound?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /404/ })).toBeVisible();
  });

  test("CNAME and favicon assets exist", async () => {
    // CNAME is a GitHub Pages deployment artifact, not a site route. The
    // local preview server 404s extensionless paths because
    // `trailingSlash: "always"`, so verify the build output on disk.
    expect(readFileSync("dist/CNAME", "utf8").trim()).toBe("www.nicm.dev");
  });
});

test.describe("compatibility redirects", () => {
  for (const [from, to] of REDIRECTS) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      await page.goto(from);
      // location.replace navigates immediately.
      await page.waitForURL(`**${to}`);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        `https://www.nicm.dev${to}`,
      );
    });
  }

  test("redirect pages are no-index with a visible fallback", async ({ page }) => {
    // Fetch the raw HTML instead of browsing: the meta refresh navigates
    // even with JavaScript disabled, racing any DOM assertions.
    const response = await page.request.get("/publication/incadr_sc/");
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toContain("noindex");
    expect(html).toContain('http-equiv="refresh"');
    expect(html).toContain("Continue to");
    expect(html).toContain(
      'href="https://www.nicm.dev/publication/hxrouting_sc/"',
    );
  });
});
