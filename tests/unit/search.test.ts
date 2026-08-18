import { describe, it, expect } from "vitest";
import {
  rankDocuments,
  scoreDocument,
  highlightMatches,
  FIELD_WEIGHTS,
  type SearchDocument,
} from "../../src/utils/search.ts";

const docs: SearchDocument[] = [
  {
    url: "/#about",
    kind: "profile",
    title: "Nic McDonald",
    summary: "I am a computer architecture research scientist.",
    tags: ["Computer Architecture", "Interconnection Networks"],
    authors: ["Nic McDonald"],
  },
  {
    url: "/project/supersim/",
    kind: "project",
    title: "SuperSim",
    summary: "A flit-level interconnection network simulator.",
    tags: ["Cpp", "Simulation", "Networks"],
    authors: ["Nic McDonald"],
  },
  {
    url: "/publication/hxrouting_sc/",
    kind: "publication",
    title: "Practical and Efficient Incremental Adaptive Routing for HyperX Networks",
    summary: "We present two practical and efficient incremental adaptive routing algorithms for HyperX.",
    tags: ["Networks"],
    authors: ["Nic McDonald", "Mikhail Isaev", "Adriana Flores", "Al Davis", "John Kim"],
  },
];

describe("scoreDocument", () => {
  it("weights title matches above tag matches above summary matches", () => {
    const titleHit = scoreDocument(docs[1]!, "supersim"); // title
    const tagHit = scoreDocument(docs[1]!, "simulation"); // tag
    const summaryHit = scoreDocument(docs[1]!, "flit-level"); // summary only
    expect(titleHit).toBe(FIELD_WEIGHTS.title);
    expect(tagHit).toBe(FIELD_WEIGHTS.tags);
    expect(summaryHit).toBe(FIELD_WEIGHTS.summary);
    expect(titleHit).toBeGreaterThan(tagHit);
    expect(tagHit).toBeGreaterThan(summaryHit);
  });

  it("is case-insensitive", () => {
    const results = rankDocuments(docs, "SUPERSIM");
    expect(results[0]!.score).toBe(FIELD_WEIGHTS.title);
  });

  it("scores author matches", () => {
    expect(scoreDocument(docs[2]!, "isaev")).toBe(FIELD_WEIGHTS.authors);
  });
});

describe("rankDocuments", () => {
  it("returns only matching documents sorted by score", () => {
    const results = rankDocuments(docs, "networks");
    expect(results.length).toBe(3);
    // supersim: tag(5) + summary(1) = 6; hxrouting: title(10)+tag(5)+summary(0)=15... verify ordering is by score desc
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });

  it("breaks ties deterministically by title", () => {
    const tieDocs: SearchDocument[] = [
      { url: "/b", kind: "project", title: "Beta", summary: "", tags: ["x"], authors: [] },
      { url: "/a", kind: "project", title: "Alpha", summary: "", tags: ["x"], authors: [] },
    ];
    const results = rankDocuments(tieDocs, "x");
    expect(results.map((r) => r.document.title)).toEqual(["Alpha", "Beta"]);
  });

  it("returns nothing for empty or blank queries", () => {
    expect(rankDocuments(docs, "")).toEqual([]);
    expect(rankDocuments(docs, "   ")).toEqual([]);
  });

  it("returns nothing when no document matches", () => {
    expect(rankDocuments(docs, "zzzznotfound")).toEqual([]);
  });
});

describe("highlightMatches", () => {
  it("splits text into match and non-match parts preserving the input", () => {
    const parts = highlightMatches("SuperSim simulator", "sim");
    expect(parts.map((p) => p.text).join("")).toBe("SuperSim simulator");
    expect(parts.filter((p) => p.match).map((p) => p.text.toLowerCase())).toEqual([
      "sim",
      "sim",
    ]);
  });

  it("returns the whole text as one non-match part for empty queries", () => {
    expect(highlightMatches("hello", "")).toEqual([{ text: "hello", match: false }]);
  });
});
