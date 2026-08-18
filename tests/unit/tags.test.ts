import { describe, it, expect } from "vitest";
import { tagSlug, publicationTypeLabel } from "../../src/utils/tags.ts";

describe("tagSlug", () => {
  it("normalizes all legacy display tags to their canonical slugs", () => {
    const cases: [string, string][] = [
      ["Cpp", "cpp"],
      ["Development", "development"],
      ["Distributed Computing", "distributed-computing"],
      ["Networks", "networks"],
      ["Python", "python"],
      ["Security", "security"],
      ["Simulation", "simulation"],
      ["Task Management", "task-management"],
    ];
    for (const [display, slug] of cases) {
      expect(tagSlug(display)).toBe(slug);
    }
  });

  it("handles C++-style names defensively", () => {
    expect(tagSlug("C++")).toBe("cpp");
  });

  it("trims whitespace and collapses separators", () => {
    expect(tagSlug("  High   Performance  ")).toBe("high-performance");
  });
});

describe("publicationTypeLabel", () => {
  it("labels the types used by this site", () => {
    expect(publicationTypeLabel("1")).toBe("Conference paper");
    expect(publicationTypeLabel("7")).toBe("Thesis");
  });

  it("covers the full Hugo Academic legend", () => {
    expect(publicationTypeLabel("0")).toBe("Uncategorized");
    expect(publicationTypeLabel("2")).toBe("Journal article");
    expect(publicationTypeLabel("3")).toBe("Preprint / Working Paper");
    expect(publicationTypeLabel("4")).toBe("Report");
    expect(publicationTypeLabel("5")).toBe("Book");
    expect(publicationTypeLabel("6")).toBe("Book section");
    expect(publicationTypeLabel("8")).toBe("Patent");
  });

  it("throws on unknown types", () => {
    expect(() => publicationTypeLabel("9")).toThrow();
  });
});
