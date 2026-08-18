---
name: add-proj
description: Use when the user wants to add a new project (software package, simulator, tool, etc.) to this website. Guides an interactive workflow to collect the project details, repository URL, featured image, tags, and optional publication links, then creates all required files and validates the build.
---

# Add a project

Projects are validated Astro content entries. Every project **must** have a
featured image and a repository URL; tags and related publications are
optional. Work interactively: gather everything from the user first, then
create files, then validate.

## Getting files from the user

When the user gives you a URL for a file (featured image, ...) and the
download fails (403, bot block, ...), do NOT search for alternative sources
or mirrors. Stop and ask the user to download the file themselves and give
you the local path.

## Step 1 — Gather information from the user

Ask the user for each of the following. Propose sensible defaults and confirm
before writing anything.

### Required

- **Title** of the project.
- **Slug**: propose one following the existing convention — a short lowercase
  name with no separators (e.g. `supersim`, `taskrun`, `libdes`). Must be
  unique across `src/content/projects/`. Never change once published — URLs
  are a public contract.
- **Summary**: 1–2 sentence plain-language summary (rendered on the homepage
  card and the detail page).
- **Date**: ISO 8601, e.g. `2013-05-01T00:00:00Z`. Projects render
  newest-first on the homepage, so the date controls the card position.
- **externalUrl**: the repository URL (e.g.
  `https://github.com/nicmcd/<repo>`). Rendered as the "Go to Project Site"
  button.
- **Featured image**: ask for the source image file path; it will be copied
  to `src/content/projects/<slug>/featured.<ext>` (keep the original
  extension). Alternatively propose an image and get explicit approval before
  using it — never pick one silently. Also ask for descriptive **alt text**
  (required).

### Optional (ask explicitly; skip if the user has none)

- **Tags**: display tags, e.g. `Cpp`, `Python`, `Simulation`. Prefer reusing
  existing display tags (see `src/content/projects/*/index.md` and
  `projectFilters` in `src/site.config.ts`). A **new** display tag
  automatically creates `/tags/<tag-slug>/` pages and feeds (which must be
  added to the test inventories — see step 2) and appears in the homepage tag
  cloud; add a matching filter to `projectFilters` in `src/site.config.ts`
  only if it should be filterable.
- **relatedPublications**: slugs from `src/content/publications/` related to
  this project. For each linked publication, also add the new project slug to
  that publication's `projects` list in its `index.md` (both directions are
  rendered independently).

## Step 2 — Create the files

1. `src/content/projects/<slug>/index.md` — frontmatter template:

   ```yaml
   ---
   slug: <slug>
   title: <title>
   summary: <1-2 sentence summary>
   tags:
     - <Tag>
   date: "<YYYY-MM-DD>T00:00:00Z"
   externalUrl: <repository-url>
   image: ./featured.<ext>
   imageAlt: <descriptive alt text>
   relatedPublications: []   # or list of publication slugs
   ---
   ```

   Match the formatting of existing entries (see
   `src/content/projects/supersim/index.md` for one with linked publications,
   `src/content/projects/taskrun/index.md` for one without).

2. Copy the featured image to `src/content/projects/<slug>/featured.<ext>`
   (keep the original extension; `image:` references it as
   `./featured.<ext>`).

3. If a new display tag should be filterable, add it to `projectFilters` in
   `src/site.config.ts` (`tag` is the display tag matched against project
   tags, e.g. `Cpp` for C++).

4. If publications were linked, update each publication's
   `src/content/publications/<publication>/index.md` to add the new slug to
   `projects`.

5. Update the hardcoded content inventories in the tests. Bump counts by one
   and insert routes in sorted order; homepage cards render date-descending,
   so ordered expectations follow that:
   - `tests/e2e/routes.spec.ts`: add `/project/<slug>/` to
     `CANONICAL_ROUTES` and bump the project count in the counts test. For
     each **new** tag also add `/tags/<tag-slug>/` to `CANONICAL_ROUTES`,
     `/tags/<tag-slug>/index.xml` to `RSS_FEEDS`, and
     `["/tags/<tag-slug>/page/1/", "/tags/<tag-slug>/"]` to `REDIRECTS`.
   - `tests/e2e/crawl.spec.ts`: add `/project/<slug>/` (and any new
     `/tags/<tag-slug>/` pages) to `SEED_PAGES`.
   - `tests/e2e/search.spec.ts`: bump the total document count and add a
     `"project"` entry to the sorted `kinds` list.
   - `tests/e2e/homepage.spec.ts`: add the project title to `All` and to each
     matching filter in `EXPECTED_FILTERS` (lists follow date-descending
     render order), bump the two `.project-card` counts, and add any new tag
     to the "popular topics" list.
   - `tests/e2e/no-js.spec.ts`: bump the `.project-card` count.
   - `tests/unit/filter.test.ts`: add the slug → tags entry to `cards` and
     update the `"All"` expectation (plus any tag-specific expectations the
     new project matches).

## Step 3 — Validate

Run the full suite and ensure all steps pass:

```sh
npm run test:suite
```

This runs validate, check, unit tests, build, and e2e with caching, so the
pre-commit hook afterwards skips everything. `npm run validate` checks slug
uniqueness, image alt text, and that `relatedPublications` references
resolve. Fix any reported errors and re-run until green. Do not commit
anything unless the user asks.
