import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  validateContent,
  type ValidationInput,
} from "../../src/utils/validate.ts";

function makePublicDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "nicm-validate-"));
  writeFileSync(join(dir, "paper.pdf"), "pdf");
  writeFileSync(join(dir, "slides.pdf"), "pdf");
  writeFileSync(join(dir, "poster.pdf"), "pdf");
  writeFileSync(join(dir, "cite.bib"), "bib");
  return dir;
}

function validInput(publicDir: string): ValidationInput {
  return {
    authors: [
      { slug: "admin", primary: true },
      { slug: "coauthor", primary: false },
    ],
    projects: [
      { slug: "proj", imageAlt: "alt", relatedPublications: ["pub"] },
    ],
    publications: [
      {
        slug: "pub",
        authors: ["admin", "coauthor"],
        projects: ["proj"],
        imageAlt: "alt",
        pdf: "paper.pdf",
        slides: "slides.pdf",
        poster: "poster.pdf",
        bibPath: "cite.bib",
      },
    ],
    experience: [
      {
        title: "Job",
        dateStart: new Date("2020-01-01"),
        dateEnd: new Date("2021-01-01"),
      },
    ],
    patents: [
      {
        id: "us1",
        title: "Widget",
        patentNumber: "US1234567B2",
        date: new Date("2020-06-01"),
      },
    ],
    publicDir,
  };
}

describe("content relationship validation", () => {
  const publicDir = makePublicDir();

  it("accepts valid content", () => {
    expect(validateContent(validInput(publicDir))).toEqual([]);
  });

  it("rejects unknown author references", () => {
    const input = validInput(publicDir);
    input.publications[0]!.authors = ["admin", "ghost"];
    expect(validateContent(input)).toContain(
      'publication "pub": unknown author "ghost"',
    );
  });

  it("rejects unknown project references from publications", () => {
    const input = validInput(publicDir);
    input.publications[0]!.projects = ["ghost"];
    expect(validateContent(input)).toContain(
      'publication "pub": unknown project "ghost"',
    );
  });

  it("rejects unknown publication references from projects", () => {
    const input = validInput(publicDir);
    input.projects[0]!.relatedPublications = ["ghost"];
    expect(validateContent(input)).toContain(
      'project "proj": unknown publication "ghost"',
    );
  });

  it("rejects duplicate slugs", () => {
    const input = validInput(publicDir);
    input.authors.push({ slug: "admin", primary: false });
    expect(validateContent(input)).toContain('authors: duplicate slug "admin"');
  });

  it("requires exactly one primary author", () => {
    const input = validInput(publicDir);
    input.authors[1]!.primary = true;
    expect(
      validateContent(input).some((e) => e.includes("primary author")),
    ).toBe(true);
  });

  it("rejects missing internal assets", () => {
    const input = validInput(publicDir);
    input.publications[0]!.pdf = "missing.pdf";
    expect(validateContent(input)).toContain(
      'publication "pub": missing asset "missing.pdf"',
    );
  });

  it("rejects empty image alt text", () => {
    const input = validInput(publicDir);
    input.projects[0]!.imageAlt = "  ";
    expect(validateContent(input)).toContain(
      'project "proj": missing image alt text',
    );
  });

  it("rejects redundant words in project image alt text", () => {
    const input = validInput(publicDir);
    input.projects[0]!.imageAlt = "Project featured image";
    expect(validateContent(input)).toContain(
      'project "proj": image alt text contains redundant word (image, picture, photo)',
    );
  });

  it("rejects redundant words in publication image alt text", () => {
    const input = validInput(publicDir);
    input.publications[0]!.imageAlt = "Photo of the results";
    expect(validateContent(input)).toContain(
      'publication "pub": image alt text contains redundant word (image, picture, photo)',
    );
  });

  it("rejects redundant words in avatar alt text", () => {
    const input = validInput(publicDir);
    input.authors[0]!.avatarAlt = "Picture of the author";
    expect(validateContent(input)).toContain(
      'author "admin": avatar alt text contains redundant word (image, picture, photo)',
    );
  });

  it("rejects experience end dates before start dates", () => {
    const input = validInput(publicDir);
    input.experience[0]!.dateEnd = new Date("2019-01-01");
    expect(validateContent(input)).toContain(
      'experience "Job": end date precedes start date',
    );
  });

  it("rejects duplicate patent ids", () => {
    const input = validInput(publicDir);
    input.patents.push({
      id: "us1",
      title: "Other widget",
      patentNumber: "US7654321B2",
      date: new Date("2021-01-01"),
    });
    expect(validateContent(input)).toContain('patents: duplicate slug "us1"');
  });

  it("rejects duplicate patent numbers", () => {
    const input = validInput(publicDir);
    input.patents.push({
      id: "us2",
      title: "Other widget",
      patentNumber: "US1234567B2",
      date: new Date("2021-01-01"),
    });
    expect(validateContent(input)).toContain(
      'patents: duplicate slug "US1234567B2"',
    );
  });

  it("rejects invalid patent dates", () => {
    const input = validInput(publicDir);
    input.patents[0]!.date = new Date(Number.NaN);
    expect(validateContent(input)).toContain('patent "Widget": invalid date');
  });
});
