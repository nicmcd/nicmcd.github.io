import { describe, it, expect } from "vitest";
import { legacyRedirects } from "../../src/utils/redirects.ts";

const TAG_SLUGS = [
  "cpp",
  "development",
  "distributed-computing",
  "networks",
  "python",
  "security",
  "simulation",
  "task-management",
];

describe("legacy redirect mapping", () => {
  const redirects = legacyRedirects(TAG_SLUGS);
  const byFrom = new Map(redirects.map((r) => [r.from, r.to]));

  it("redirects the stale incadr_sc publication to hxrouting_sc", () => {
    expect(byFrom.get("/publication/incadr_sc/")).toBe("/publication/hxrouting_sc/");
  });

  it("redirects categories to tags", () => {
    expect(byFrom.get("/categories/")).toBe("/tags/");
    expect(byFrom.get("/categories/page/1/")).toBe("/tags/");
  });

  it("redirects every /page/1/ pagination alias to its parent", () => {
    const expected: [string, string][] = [
      ["/authors/page/1/", "/authors/"],
      ["/project/page/1/", "/project/"],
      ["/publication_types/page/1/", "/publication_types/"],
      ["/publication_types/1/page/1/", "/publication_types/1/"],
      ["/publication_types/7/page/1/", "/publication_types/7/"],
      ["/tags/page/1/", "/tags/"],
    ];
    for (const [from, to] of expected) {
      expect(byFrom.get(from)).toBe(to);
    }
  });

  it("redirects every tag pagination alias", () => {
    for (const slug of TAG_SLUGS) {
      expect(byFrom.get(`/tags/${slug}/page/1/`)).toBe(`/tags/${slug}/`);
    }
  });

  it("has no duplicate sources", () => {
    const sources = redirects.map((r) => r.from);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("covers the full legacy surface (9 static + 8 tag aliases)", () => {
    expect(redirects.length).toBe(17);
  });
});
