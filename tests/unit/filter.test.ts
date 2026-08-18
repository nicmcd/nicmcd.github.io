import { describe, it, expect } from "vitest";
import { matchesFilter } from "../../src/scripts/filter.ts";

// Card tag sets mirroring the five migrated projects.
const cards: Record<string, string[]> = {
  devsearch: ["Python", "Development"],
  libdes: ["Cpp", "Simulation"],
  paramgmt: ["Python", "Development"],
  supersim: ["Cpp", "Simulation", "Networks"],
  taskrun: ["Python", "Task Management"],
};

function visibleCards(filter: string): string[] {
  return Object.keys(cards).filter((slug) => matchesFilter(cards[slug]!, filter));
}

describe("project filtering", () => {
  it('"All" shows every project', () => {
    expect(visibleCards("*").sort()).toEqual([
      "devsearch",
      "libdes",
      "paramgmt",
      "supersim",
      "taskrun",
    ]);
  });

  it('"Networks" matches current behavior', () => {
    expect(visibleCards("Networks")).toEqual(["supersim"]);
  });

  it('"Simulation" matches current behavior', () => {
    expect(visibleCards("Simulation").sort()).toEqual(["libdes", "supersim"]);
  });

  it('"C++" (Cpp) matches current behavior', () => {
    expect(visibleCards("Cpp").sort()).toEqual(["libdes", "supersim"]);
  });

  it('"Python" matches current behavior', () => {
    expect(visibleCards("Python").sort()).toEqual([
      "devsearch",
      "paramgmt",
      "taskrun",
    ]);
  });

  it("unknown tags show nothing", () => {
    expect(visibleCards("Rust")).toEqual([]);
  });
});
