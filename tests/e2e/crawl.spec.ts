import { test, expect } from "@playwright/test";

/**
 * Internal-link and asset crawl against `astro preview`.
 *
 * Fails on broken canonical links, missing images, missing downloadable
 * files, duplicate IDs, or incorrect canonical URLs.
 */

const SEED_PAGES = [
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
  "/404.html",
];

function extractRefs(html: string): { hrefs: string[]; srcs: string[] } {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);
  const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]!);
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) =>
    m[1]!.split(",").map((part) => part.trim().split(/\s+/)[0]!),
  );
  return { hrefs, srcs: [...srcs, ...srcsets] };
}

function isInternal(ref: string): boolean {
  return (
    ref.startsWith("/") &&
    !ref.startsWith("//") &&
    !ref.startsWith("/#")
  );
}

test.describe("link and asset crawl", () => {
  test.skip(({ isMobile }) => isMobile, "crawl runs once per environment");

  test("no broken links, missing assets, duplicate IDs, or wrong canonicals", async ({
    page,
    baseURL,
  }) => {
    const broken: string[] = [];
    const checked = new Set<string>();

    const checkUrl = async (url: string, from: string): Promise<void> => {
      const clean = url.split("#")[0]!;
      if (clean === "" || checked.has(clean)) return;
      checked.add(clean);
      const response = await page.request.get(clean);
      if (!response.ok()) {
        broken.push(`${from} -> ${clean} (${response.status()})`);
      }
    };

    for (const seed of SEED_PAGES) {
      const response = await page.request.get(seed);
      expect(response.ok(), `${seed} should return 200`).toBe(true);
      const html = await response.text();

      // Canonical URL correctness (404 and redirect pages excluded).
      if (seed !== "/404.html") {
        const canonical = /rel="canonical" href="([^"]+)"/.exec(html)?.[1];
        expect(canonical, `${seed} canonical`).toBe(
          `https://www.nicm.dev${seed}`,
        );
      }

      // Duplicate ID check.
      const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]!);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(dupes, `${seed} duplicate ids`).toEqual([]);

      const { hrefs, srcs } = extractRefs(html);
      for (const href of hrefs.filter(isInternal)) {
        await checkUrl(href, seed);
      }
      for (const src of srcs.filter(isInternal)) {
        await checkUrl(src, seed);
      }
    }

    expect(broken, "broken internal references").toEqual([]);
  });

  test("built HTML contains no legacy framework or tracking references", async ({
    page,
  }) => {
    const forbidden = [
      /hugo/i,
      /google-analytics\.com/i,
      /googletagmanager\.com/i,
      /UA-120986361/,
      /formspree/i,
      /leaflet/i,
      /bootstrap/i,
      /jquery/i,
      /font\s*awesome/i,
      /fonts\.googleapis\.com/i,
      /fonts\.gstatic\.com/i,
      /cdn\.jsdelivr\.net/i,
      /unpkg\.com/i,
      /cloudflare\.com\/ajax/i,
    ];
    for (const seed of SEED_PAGES) {
      const response = await page.request.get(seed);
      expect(response.ok(), `${seed} should return 200`).toBe(true);
      const html = await response.text();
      for (const pattern of forbidden) {
        expect(pattern.test(html), `${seed} must not reference ${pattern}`).toBe(
          false,
        );
      }
    }
  });

  test("all canonical PDFs, slides, and BibTeX files download", async ({ page }) => {
    const assets = [
      "/pubs/nicmcdonald_cv.pdf",
      "/pubs/nicmcdonald_hpsoc_stanford_2016.pdf",
      "/pubs/nicmcdonald_hpsoc_stanford_2016_slides.pdf",
      "/pubs/nicmcdonald_hxrouting_sc_2019.pdf",
      "/pubs/nicmcdonald_hxrouting_sc_2019_slides.pdf",
      "/pubs/nicmcdonald_supersim_ispass_2018.pdf",
      "/pubs/nicmcdonald_supersim_ispass_2018_slides.pdf",
      "/publication/hpsoc_thesis/cite.bib",
      "/publication/hxrouting_sc/cite.bib",
      "/publication/supersim_ispass/cite.bib",
    ];
    for (const asset of assets) {
      const response = await page.request.get(asset);
      expect(response.ok(), asset).toBe(true);
      const body = await response.body();
      expect(body.length, asset).toBeGreaterThan(50);
    }
  });
});
