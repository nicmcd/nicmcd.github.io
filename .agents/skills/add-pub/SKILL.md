---
name: add-pub
description: Use when the user wants to add a new publication (conference paper, thesis, etc.) to this website. Guides an interactive workflow to collect the paper details, PDF, BibTeX citation, featured image, and optional slides/DOI/project links, then creates all required files and validates the build.
---

# Add a publication

Publications are validated Astro content entries. Every publication **must**
have a PDF and a BibTeX file; slides, DOI, and project links are optional.
Work interactively: gather everything from the user first, then create files,
then validate.

## Step 1 — Gather information from the user

Ask the user for each of the following. Propose sensible defaults and confirm
before writing anything.

### Required

- **Title** of the work.
- **Slug**: propose one following the existing convention
  `<topic>_<venueabbrev>`, lowercase with underscores (e.g. `supersim_ispass`,
  `hxrouting_sc`, `hpsoc_thesis`). Must be unique across
  `src/content/publications/`. Never change once published — URLs are a
  public contract.
- **Authors in order**: list the slugs in `src/content/authors/` and map each
  co-author to one. If an author has no entry yet, offer to create it first
  (follow the "Add an author" procedure in `AGENTS.md`). The site owner is
  `admin`.
- **Date**: ISO 8601, e.g. `2018-04-02T00:00:00Z`.
- **Type**: `"1"` = conference paper, `"7"` = thesis.
- **Venue**: full venue text; markdown italics are used by convention, e.g.
  `In *The International Symposium on Performance Analysis of Systems and Software 2018*`
  or `*Stanford University*` for a thesis.
- **Abstract**: the full abstract text.
- **Summary**: 1–2 sentence plain-language summary.
- **Featured image**: ask for the source image file path; it will be copied
  to `src/content/publications/<slug>/featured.<ext>`. Also ask for
  descriptive **alt text** (required).
- **PDF**: ask for the source PDF file path. It will be copied to
  `public/pubs/` with the filename format
  `<leadauthor>_<shortpapername>_<venue>_<year>.pdf` (lead author's surname,
  lowercase, no separators; e.g. `nicmcdonald_supersim_ispass_2018.pdf`) —
  propose the name and confirm with the user.
- **BibTeX**: ask the user to paste the BibTeX entry or give a file path. It
  will be written verbatim to `public/publication/<slug>/cite.bib`.

### Optional (ask explicitly; skip if the user has none)

- **Slides PDF**: source file path; copied to `public/pubs/` using the same
  base name as the paper PDF with a `_slides` suffix:
  `<leadauthor>_<shortpapername>_<venue>_<year>_slides.pdf`.
- **DOI**: bare DOI string, e.g. `10.1109/ISPASS.2018.00017` (`""` if none).
- **venueShort**: short form, e.g. `In *ISPASS 2018*` (`""` if none).
- **Tags**: display tags, e.g. `Simulation`, `Networks`.
- **Projects**: slugs from `src/content/projects/` related to this work. For
  each linked project, also add the new publication slug to that project's
  `relatedPublications` list in its `index.md` (both directions are rendered
  independently).

## Step 2 — Create the files

1. `src/content/publications/<slug>/index.md` — frontmatter template:

   ```yaml
   ---
   slug: <slug>
   title: "<title>"
   authors:
     - <author-slug-1>
     - <author-slug-2>
   date: "<YYYY-MM-DD>T00:00:00Z"
   type: "1"            # or "7" for a thesis
   venue: In *<Full Venue Name Year>*
   venueShort: In *<VenueAbbrev Year>*   # "" if none
   abstract: <full abstract, single line>
   summary: <1-2 sentence summary>
   tags:
     - <Tag>
   doi: <doi>           # "" if none
   image: ./featured.<ext>
   imageAlt: <descriptive alt text>
   projects: []         # or list of project slugs
   pdf: pubs/<pdf-file>.pdf
   slides: pubs/<slides-file>.pdf   # omit this line entirely if no slides
   bibPath: publication/<slug>/cite.bib
   ---
   ```

   Note: `slides` is optional in the schema — omit the key when there are no
   slides. `doi` and `venueShort` use `""` when absent. Match the formatting
   of existing entries (see `src/content/publications/supersim_ispass/index.md`).

2. Copy the featured image to `src/content/publications/<slug>/featured.<ext>`
   (keep the original extension; `image:` references it as `./featured.<ext>`).

3. Copy the PDF (and slides, if any) into `public/pubs/` using the confirmed
   file names.

4. Write the BibTeX verbatim to `public/publication/<slug>/cite.bib`.

5. If projects were linked, update each project's
   `src/content/projects/<project>/index.md` to add the new slug to
   `relatedPublications`.

## Step 3 — Validate

Run and ensure all pass with 0 errors:

```sh
npm run validate && npm run check && npm test && npm run build
```

`npm run validate` checks cross-references (authors, projects), slug
uniqueness, and that `pdf`/`slides`/`bibPath` assets exist under `public/`.
Fix any reported errors and re-run until green. Do not commit anything unless
the user asks.
