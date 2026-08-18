import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { loadBibtex } from "../../src/utils/citations.ts";

describe("citation loading", () => {
  it("loads the verbatim BibTeX for each publication", () => {
    for (const slug of ["hpsoc_thesis", "hxrouting_sc", "supersim_ispass"]) {
      const bibPath = `publication/${slug}/cite.bib`;
      const fromUtil = loadBibtex(bibPath);
      const verbatim = readFileSync(`public/${bibPath}`, "utf8");
      expect(fromUtil).toBe(verbatim);
      expect(fromUtil).toMatch(/^@\w+\{/);
    }
  });

  it("loads expected BibTeX entry types", () => {
    expect(loadBibtex("publication/hpsoc_thesis/cite.bib")).toContain("@phdthesis");
    expect(loadBibtex("publication/hxrouting_sc/cite.bib")).toContain(
      "@inproceedings",
    );
    expect(loadBibtex("publication/supersim_ispass/cite.bib")).toContain(
      "@inproceedings",
    );
  });

  it("throws for missing files", () => {
    expect(() => loadBibtex("publication/nonexistent/cite.bib")).toThrow();
  });
});
