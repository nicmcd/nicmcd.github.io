---
name: add-patent
description: Use when the user wants to add a new patent (granted US patent or published US patent application) to this website. Guides an interactive workflow to look up the patent metadata on Google Patents, confirm the details with the user, add the entry to the patents collection, and validate the build.
---

# Add a patent

Patents are validated Astro content entries in a single YAML file:
`src/content/patents.yaml` (the `file()` loader pattern, like
`experience.yaml`). They have **no images, no detail pages, and no PDFs** —
each entry links externally to Google Patents. Work interactively: gather
everything from the user first, then edit, then validate.

## Step 1 — Gather information from the user

Ask the user for one of:

- a **US publication number** (e.g. `US10887217B2` for a granted patent or
  `US20180316599A1` for a published application), or
- a **Google Patents URL**, or
- an **invention title** (then search for it).

Then look up the metadata yourself and confirm it with the user before
editing anything.

### Looking up the metadata

Primary source — the Google Patents XHR query API (read-only GET, returns
JSON with title, dates, assignee, inventor, and family status):

```sh
curl -sS "https://patents.google.com/xhr/query?url=q%3D<NUMBER>&exp="
```

For inventor-based discovery (e.g. the site owner is listed as "Nicholas
George McDonald", sometimes "Nicholas McDonald"):

```sh
curl -sS "https://patents.google.com/xhr/query?url=inventor%3D%22Nicholas%2BGeorge%2BMcDonald%22&exp="
```

Paginate with `%26page%3D1`, `%26page%3D2`, ... when `total_num_pages` > 1.
Google rate-limits bursts with a 503 "Sorry" page; back off and retry after
a minute, and never hammer.

Fallback sources when Google Patents is unreachable:

- `https://www.freepatentsonline.com/<number>.html` for granted patents
  (e.g. `10476780` — drop the `US` prefix and kind code) and
  `https://www.freepatentsonline.com/y<yyyy>/<nnnnnnn>.html` for published
  applications (e.g. `y2018/0316599`). Grant pages show "Publication Date"
  (= grant date), filing date, and assignee.
- `https://www.freepatentsonline.com/result.html?query_txt=%22<phrase>%22&submit=&patents=on`
  with a distinctive title/abstract phrase to find family members (granted
  `B2` counterparts of pending `A1` applications).
- `https://patents.justia.com/patent/<number>` for granted patents.

### Resolution rules

- **One entry per invention.** Prefer the granted US patent (`...B2`) over
  its published application (`...A1`) when both exist. When several grants
  exist (parent + continuations), use the earliest grant number. Foreign
  family members (EP, DE, WO, CN, HK, JP) are never listed separately.
- **Status**: `granted` when the canonical number is a `B2` grant,
  `pending` when only an `A1` application publication exists. If adding a
  pending application, first search for a granted counterpart by title —
  applications frequently grant later.
- **Date**: the grant date for granted patents, the publication date for
  pending applications. ISO 8601 (`YYYY-MM-DD`).
- **Assignee**: short display form, e.g. `Hewlett Packard Enterprise` or
  `Google` (not the full legal entity suffix like "Development LP"/"LLC").
- **Title**: sentence case as recorded (e.g. `Routing packets based on
  congestion of minimal and non-minimal routes`).
- **id**: `us` + the digits of the publication number, lowercase
  (e.g. `us10887217`, `us20180316599`). Must be unique in the file.
- **url**: `https://patents.google.com/patent/<NUMBER>/en`.

Confirm the full field set (title, patentNumber, url, date, status,
assignee) with the user before writing.

## Step 2 — Edit the files

1. Append the entry to `src/content/patents.yaml` in **date-ascending**
   order (the site re-sorts by date descending at render time, but keep the
   file tidy):

   ```yaml
   - id: us10887217
     title: Routing packets based on congestion metric thresholds and weights
     patentNumber: US10887217B2
     url: https://patents.google.com/patent/US10887217B2/en
     date: "2021-01-05"
     status: granted        # or: pending
     assignee: Hewlett Packard Enterprise
   ```

   `patentNumber` must match `^US\d+[A-Z]\d$` (digits + kind code).

2. Update the hardcoded content inventories in the tests:
   - `tests/e2e/homepage.spec.ts` — the `.patent-item` count, the
     Granted/Pending tag counts, and the first-entry assertions in the
     patents test.
   - `tests/e2e/search.spec.ts` — total document count and the `kinds`
     array (one more `"patent"`).
   - `tests/e2e/routes.spec.ts` — the patent count assertion.
   - `tests/e2e/no-js.spec.ts` — the `.patent-item` count.
   - `tests/e2e/patents.spec.ts` — item counts, Granted/Pending counts, and
     first/last-entry assertions (date order may shift).

## Step 3 — Validate

Run the full suite and ensure all steps pass:

```sh
npm run test:suite
```

This runs validate, check, unit tests, build, and e2e with caching, so the
pre-commit hook afterwards skips everything. `npm run validate` checks
patent id/number uniqueness and date sanity. Fix any reported errors and
re-run until green. Do not commit anything unless the user asks.
