# AGENTS.md

Guidance for coding agents working on this repository: the personal website of
Nic McDonald (`https://www.nicm.dev`), built with Astro, strict TypeScript,
native CSS, and small framework-free browser scripts. Deployed to GitHub Pages
from this repository via GitHub Actions.

## Commands

| Command              | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `npm run dev`        | Local dev server.                                              |
| `npm run build`      | Production build into `dist/` (never commit `dist/`).          |
| `npm run preview`    | Serve `dist/` locally (Astro 7 daemonizes; see note below).    |
| `npm run check`      | `astro check` type checking. Must pass with 0 errors.          |
| `npm run validate`   | Content validation (cross-references, slugs, assets, dates).   |
| `npm test`           | Vitest unit tests.                                             |
| `npm run test:e2e`   | Playwright e2e suite against a production build.               |
| `npm run screenshots`| Regenerate the local reference screenshots (git-ignored).      |

Note: in Astro 7, `astro preview` starts a background daemon and exits. Use
`npx astro preview stop` to stop it. Playwright uses
`scripts/preview-foreground.ts`, a foreground wrapper, plus a global teardown
that stops the daemon. The e2e server runs on dedicated port 4421 (set via
`E2E_PORT` in `playwright.config.ts`) so it never collides with a local
dev/preview server on Astro's default port 4321.

## Content model

Content lives in validated Astro content collections (`src/content.config.ts`).
**Every entry requires an explicit `slug` field** so underscores in existing
URLs (e.g. `/publication/hxrouting_sc/`) are never altered by Astro's ID
handling.

- `authors` (`src/content/authors/*.md`, primary author in
  `authors/admin/index.md`): `slug`, `name`, `primary`, optional `role`,
  `organization` (`name`/`url`), `bio`, `interests[]`, `education[]`
  (`course`/`institution`/`year`), `social[]` (`icon` one of `envelope`,
  `google-scholar`, `github`, `bitbucket`, `linkedin`; `label`; `url`),
  optional `avatar` image and `avatarAlt`.
- `projects` (`src/content/projects/<slug>/index.md` + `featured.*`):
  `slug`, `title`, `summary`, `date`, `tags[]`, `externalUrl` (repository),
  `image`, `imageAlt`, `relatedPublications[]` (publication slugs).
- `publications` (`src/content/publications/<slug>/index.md` + `featured.*`):
  `slug`, `title`, `authors[]` (author slugs), `date`, `type` (`"1"` =
  conference paper, `"7"` = thesis), `venue`, `venueShort`, `abstract`,
  `summary`, `tags[]`, `doi`, `image`, `imageAlt`, `projects[]` (project
  slugs), `pdf` (`pubs/....pdf`), optional `slides` and `poster`
  (`pubs/....pdf`), `bibPath` (`publication/<slug>/cite.bib`).
- `experience` (`src/content/experience.yaml`): `order` (explicit display
  order), `title`, `company`, `companyUrl`, `location`, `dateStart`,
  optional `dateEnd`, verbatim `description`.

Navigation, site metadata, contact email, CV path, social profiles, theme
colors, and project filter definitions live in one typed module:
`src/site.config.ts`.

Build-time validation (`src/utils/validate.ts`, run by `npm run validate` and
by an Astro integration during `astro build`) checks cross-collection
author/project/publication references, unique slugs, valid internal asset
paths, valid dates, and required image alt text.

## URL-stability rules

URLs are a public contract. Do not rename, re-slug, or restructure routes.

- Canonical routes: `/`, `/project/` + details, `/publication/` + details,
  `/tags/` + tag pages, `/authors/` + author pages, `/publication_types/` +
  `1/` and `7/`, `/404.html`, `/index.json`, `/index.xml`,
  `/index.webmanifest`, `/robots.txt`, `/sitemap.xml`, and RSS feeds at their
  existing `index.xml` paths.
- PDFs, slides, and posters stay under `/pubs/...`; citation downloads stay
  at `/publication/<slug>/cite.bib`.
- Tag URL slugs come from `tagSlug()` in `src/utils/tags.ts` (lowercase,
  `++` → `pp`, non-alphanumerics → `-`). Display tags like `Cpp` map to
  `/tags/cpp/`.
- Legacy compatibility pages (`/publication/incadr_sc/`, `/categories/...`,
  `/page/1/` aliases) are lightweight no-index redirects with canonical
  links, meta refresh, `location.replace`, and a visible fallback link. Their
  mapping lives in `src/utils/redirects.ts`; keep them working.
- Trailing slashes are required (`trailingSlash: "always"`).

## Design tokens

All colors, typography, spacing, radii, shadows, widths, and breakpoints are
native CSS custom properties defined at the top of `src/styles/global.css`.
Use the tokens; do not introduce hard-coded values in components.

- Fonts: B612 Mono (body), Orbitron (display headings), bundled locally via
  Fontsource — no font CDNs.
- Primary blue `#2962ff`; dark backgrounds `#282a36` with alternating section
  shades `#272935` / `#23252f`; muted blue-gray headings (`#98a6ad` in dark).
- Breakpoints: 576 / 768 / 992 / 1200 px (`--bp-sm/md/lg/xl`); e2e tests run
  at 390, 768, and 1440 px widths.
- Theming: default from `prefers-color-scheme`, explicit choice persisted in
  `localStorage`, minimal inline head script prevents theme flash. Light and
  dark token sets both live in `global.css`.

## Dependency policy

- Production dependencies are limited to `astro`, `@astrojs/rss`, and the
  locally bundled Fontsource packages `@fontsource/b612-mono` and
  `@fontsource/orbitron`.
- No Hugo, React, Tailwind, Bootstrap, jQuery, Isotope, Leaflet, analytics,
  cookies, or runtime CDN dependencies. Icons are local inline SVG
  (`src/components/Icon.astro`).
- Dev dependencies (TypeScript, `@astrojs/check`, Vitest, Playwright,
  `@axe-core/playwright`, `yaml`) are for build/test only.
- Use npm with the committed `package-lock.json`; install with `npm ci`.
- Never commit `.env` or API keys.

## Procedures

### Add a project

1. Create `src/content/projects/<slug>/index.md` with frontmatter: `slug`,
   `title`, `summary`, `date` (ISO), `tags`, `externalUrl`, `image`,
   `imageAlt`, `relatedPublications`.
2. Add the full-resolution featured image as `featured.*` in the same folder
   and reference it as `./featured.*`.
3. If the project introduces a new display tag, add a matching filter to
   `projectFilters` in `src/site.config.ts` only if it should be filterable.
4. Run `npm run validate && npm run check && npm test && npm run build`.

### Add a publication

The `.agents/skills/add-pub` skill encodes the detailed workflow; the
canonical steps are:

1. Create `src/content/publications/<slug>/index.md` with all required
   frontmatter (see content model above). `authors` must reference existing
   author slugs; add new authors first if needed.
2. Add the featured image as `featured.*` next to `index.md`. Always ask the
   user to provide the image, or propose one (e.g. a first-page render or a
   relevant figure) and get explicit approval before using it. Set
   `imageAlt` to describe what the image shows.
3. Copy the PDF (and slides/poster, if any) to `public/pubs/` and set
   `pdf`/`slides`/`poster` to `pubs/<file>.pdf`.
4. Add the BibTeX file at `public/publication/<slug>/cite.bib` and set
   `bibPath` to `publication/<slug>/cite.bib`.
5. If it has a new type, extend `publicationTypeLabels` in
   `src/utils/tags.ts` and add the route; otherwise `type` is `"1"` or `"7"`.
6. Update the hardcoded content inventories in the tests: canonical routes,
   RSS feeds, and counts in `tests/e2e/routes.spec.ts`; seed pages and asset
   lists in `tests/e2e/crawl.spec.ts`; document counts in
   `tests/e2e/search.spec.ts`; slugs in `tests/unit/citations.test.ts`.
7. Run `npm run validate && npm run check && npm test && npm run build`.

### Add an author

1. Create `src/content/authors/<slug>.md` with `slug`, `name`, and any
   optional fields. Only the primary site owner uses
   `authors/admin/index.md` with `primary: true`, avatar, bio, interests,
   education, and social links.
2. Reference the new `slug` from publication `authors` lists as needed.
3. Run `npm run validate && npm run check && npm test && npm run build`.

### Add an experience item

1. Add an entry to `src/content/experience.yaml` with a unique `id`, the next
   `order` value (1 displays first), `title`, `company`, `companyUrl`,
   `location`, `dateStart`, optional `dateEnd`, and the verbatim
   `description`.
2. Run `npm run validate && npm run check && npm test && npm run build`.

## Testing expectations

- Keep `npm run validate`, `npm run check`, `npm test`, `npm run build`, and
  `npm run test:e2e` green. CI runs all of them on pull requests.
- E2e suite covers navigation, homepage sections, every project filter,
  search, theme behavior, publication details and citation dialogs, all
  canonical/redirect/feed routes, accessibility (axe: no serious or critical
  violations), no-JavaScript rendering, and a link/asset crawl.
- Reference screenshots (`tests/e2e/screenshots/`) are local, git-ignored
  artifacts regenerated with `npm run screenshots` (which sets
  `UPDATE_SCREENSHOTS=1`); regular e2e runs skip capture so they never
  rewrite the PNGs. Regenerate them when the design intentionally changes.

## Git hooks

- A versioned pre-commit hook lives in `.githooks/pre-commit` and runs the
  full test suite (`validate`, `check`, `test`, `build`, `test:e2e`) before
  every commit, mirroring CI. The repo is configured with
  `core.hooksPath=.githooks`; fresh clones must run
  `git config core.hooksPath .githooks` once to enable it. Bypass in an
  emergency with `git commit --no-verify`.

## Deployment

- `.github/workflows/ci.yml` runs validation, type check, unit tests, build,
  and Playwright smoke tests on pull requests.
- `.github/workflows/deploy.yml` builds and deploys `dist/` on pushes to
  `main` using the official Astro Pages action (`withastro/action`) and
  `actions/deploy-pages`, with `contents: read`, `pages: write`,
  `id-token: write`, and a `pages` deployment concurrency group.
- `public/CNAME` contains `www.nicm.dev`. `dist/` is never committed. The
  repository's Pages source must be "GitHub Actions".
