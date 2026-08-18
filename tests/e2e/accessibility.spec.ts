import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const PAGES = [
  { path: "/", name: "homepage" },
  { path: "/publication/hxrouting_sc/", name: "publication detail" },
  { path: "/project/supersim/", name: "project detail" },
  { path: "/tags/networks/", name: "tag page" },
];

for (const { path, name } of PAGES) {
  test(`axe: ${name} has no serious or critical violations (light)`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const violations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(violations).toEqual([]);
  });

  test(`axe: ${name} has no serious or critical violations (dark)`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const violations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(violations).toEqual([]);
  });
}
