import { test, expect } from "@playwright/test";

test.describe("publication detail pages", () => {
  test("renders title, authors, date, abstract, and metadata", async ({ page }) => {
    await page.goto("/publication/hxrouting_sc/");
    await expect(
      page.getByRole("heading", {
        name: "Practical and Efficient Incremental Adaptive Routing for HyperX Networks",
      }),
    ).toBeVisible();

    // Author links
    for (const [name, slug] of [
      ["Nic McDonald", "admin"],
      ["Mikhail Isaev", "mikhail-isaev"],
      ["Adriana Flores", "adriana-flores"],
      ["Al Davis", "al-davis"],
      ["John Kim", "john-kim"],
    ] as const) {
      await expect(
        page.locator(".pub-authors").getByRole("link", { name, exact: true }),
      ).toHaveAttribute("href", `/authors/${slug}/`);
    }

    await expect(page.locator("time")).toHaveText("November 2019");
    await expect(
      page.getByRole("heading", { name: "Abstract" }),
    ).toBeVisible();
    await expect(page.getByText(/incremental adaptive routing, which performs/)).toBeVisible();

    // Metadata table with human-readable type
    const typeRow = page.locator(".metadata-table tr", { hasText: "Type" });
    await expect(typeRow.getByRole("link", { name: "Conference paper" })).toHaveAttribute(
      "href",
      "/publication_types/1/",
    );
  });

  test("PDF, slides, and DOI links are preserved", async ({ page }) => {
    await page.goto("/publication/hxrouting_sc/");
    await expect(page.getByRole("link", { name: "PDF", exact: true })).toHaveAttribute(
      "href",
      "/pubs/nicmcdonald_hxrouting_sc_2019.pdf",
    );
    await expect(
      page.getByRole("link", { name: "Slides", exact: true }),
    ).toHaveAttribute("href", "/pubs/nicmcdonald_hxrouting_sc_2019_slides.pdf");

    const doi = page.getByRole("link", { name: /DOI/ }).first();
    await expect(doi).toHaveAttribute("href", "https://doi.org/10.1145/3295500.3356151");
    await expect(doi).toHaveAttribute("target", "_blank");
    await expect(doi).toHaveAttribute("rel", /noopener/);

    // PDFs actually download
    for (const pdf of [
      "/pubs/nicmcdonald_hxrouting_sc_2019.pdf",
      "/pubs/nicmcdonald_hxrouting_sc_2019_slides.pdf",
    ]) {
      const response = await page.request.get(pdf);
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain("pdf");
    }
  });

  test("paragraph publication links its poster and external video", async ({ page }) => {
    await page.goto("/publication/paragraph_icpp/");
    await expect(page.getByRole("link", { name: "Poster", exact: true })).toHaveAttribute(
      "href",
      "/pubs/mikhailisaev_paragraph_icpp_2022_poster.pdf",
    );
    const video = page.getByRole("link", { name: /Video/ });
    await expect(video).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=qo6EqRqB1XM",
    );
    await expect(video).toHaveAttribute("target", "_blank");
    await expect(video).toHaveAttribute("rel", /noopener/);
  });

  test("supersim publication keeps its Project link", async ({ page }) => {
    await page.goto("/publication/supersim_ispass/");
    await expect(page.getByRole("link", { name: "Project", exact: true })).toHaveAttribute(
      "href",
      "/project/supersim/",
    );
  });

  test("thesis has no DOI button and links to publication type 7", async ({ page }) => {
    await page.goto("/publication/hpsoc_thesis/");
    await expect(page.getByRole("link", { name: "DOI", exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Thesis", exact: true }),
    ).toHaveAttribute("href", "/publication_types/7/");
  });

  test("citation dialog opens, copies, and downloads", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/publication/hxrouting_sc/");

    const dialog = page.locator("#cite-hxrouting_sc");
    await expect(dialog).not.toBeVisible();
    await page.getByRole("button", { name: "Cite", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-cite-content]")).toContainText(
      "@inproceedings{mcdonald2019hxrouting",
    );

    // Copy via Clipboard API
    await dialog.getByRole("button", { name: "Copy" }).click();
    await expect(dialog.getByRole("button", { name: "Copied!" })).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("@inproceedings{mcdonald2019hxrouting");

    // Download points at the preserved asset
    await expect(dialog.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "/publication/hxrouting_sc/cite.bib",
    );
    const bib = await page.request.get("/publication/hxrouting_sc/cite.bib");
    expect(bib.ok()).toBe(true);
    expect(await bib.text()).toContain("@inproceedings{mcdonald2019hxrouting");

    // Close button dismisses
    await dialog.getByRole("button", { name: "Close citation dialog" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("share links use working URL-based endpoints with safe rel attributes", async ({ page }) => {
    await page.goto("/publication/hxrouting_sc/");
    const share = page.locator(".share-links");
    await expect(share.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      /^mailto:/,
    );
    for (const name of ["X \\(Twitter\\)", "Facebook", "LinkedIn", "WhatsApp", "Weibo"]) {
      const link = share.getByRole("link", { name: new RegExp(name) });
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
    const linkedin = share.getByRole("link", { name: /LinkedIn/ });
    await expect(linkedin).toHaveAttribute(
      "href",
      /linkedin\.com\/sharing\/share-offsite/,
    );
  });
});
