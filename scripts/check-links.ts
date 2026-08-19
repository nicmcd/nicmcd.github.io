/**
 * Full link check (`npm run check:links`).
 *
 * Crawls every HTML page in dist/ and verifies every reference it finds:
 * internal hrefs/srcs are resolved against the dist/ file tree, absolute
 * same-origin URLs (canonicals, feed links) are rewritten to internal
 * paths, and external http(s) links are fetched over the network.
 *
 * External results are classified by certainty: hard failures (404, 410)
 * are reported as broken and fail the run; any other non-OK result
 * (401/403/429/999 bot blocks, 5xx, timeouts, DNS errors) is reported as
 * an unverifiable warning, because many sites refuse automated requests.
 * That flakiness is also why this is a manual tool and not part of CI.
 */

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "../src/site.config.ts";

const distDir = path.resolve(new URL("../dist/", import.meta.url).pathname);
const siteOrigin = new URL(site.url).origin;

const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const BROKEN_STATUSES = new Set([404, 410]);
const HEAD_RETRY_STATUSES = new Set([400, 403, 405, 501]);

/** Maps a normalized reference to the pages that reference it. */
type SourceMap = Map<string, Set<string>>;

function addRef(map: SourceMap, ref: string, page: string): void {
  const pages = map.get(ref) ?? new Set<string>();
  pages.add(page);
  map.set(ref, pages);
}

function extractRefs(html: string): string[] {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);
  const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]!);
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) =>
    m[1]!.split(",").map((part) => part.trim().split(/\s+/)[0]!),
  );
  return [...hrefs, ...srcs, ...srcsets];
}

type Ref =
  | { kind: "internal"; path: string }
  | { kind: "external"; url: string }
  | { kind: "skip" };

function classify(ref: string, pageRoute: string): Ref {
  const noFragment = ref.split("#")[0]!.trim();
  if (
    noFragment === "" ||
    /^(mailto|tel|data|javascript):/i.test(noFragment)
  ) {
    return { kind: "skip" };
  }
  if (noFragment.startsWith("//")) {
    return { kind: "external", url: `https:${noFragment}` };
  }
  if (noFragment.startsWith("/")) {
    return { kind: "internal", path: noFragment };
  }
  if (/^https?:\/\//i.test(noFragment)) {
    try {
      const url = new URL(noFragment);
      if (url.origin === siteOrigin) {
        return { kind: "internal", path: url.pathname + url.search };
      }
      return { kind: "external", url: noFragment };
    } catch {
      return { kind: "skip" };
    }
  }
  // Relative reference: resolve against the page's route.
  try {
    const url = new URL(noFragment, `https://local${pageRoute}`);
    return { kind: "internal", path: url.pathname + url.search };
  } catch {
    return { kind: "skip" };
  }
}

/** Resolves an internal URL path to a file in dist/, or null if missing. */
function resolveInternal(urlPath: string): string | null {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]!);
  if (!clean.startsWith("/") || clean.includes("..")) return null;
  const rel = clean.slice(1);
  const trimmed = rel.replace(/\/+$/, "");
  const candidates = path.extname(trimmed)
    ? [rel]
    : // Astro emits pages as <route>/index.html, plus special-case files
      // like 404.html for the /404/ route.
      [path.join(rel, "index.html"), rel, `${trimmed}.html`];
  for (const candidate of candidates) {
    const full = path.join(distDir, candidate);
    if (full.startsWith(distDir) && existsSync(full)) return full;
  }
  return null;
}

interface ExternalResult {
  url: string;
  status?: number;
  error?: string;
}

async function fetchStatus(url: string): Promise<ExternalResult> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "user-agent": USER_AGENT, accept: "*/*" },
      });
      await response.body?.cancel();
      if (method === "HEAD" && HEAD_RETRY_STATUSES.has(response.status)) {
        continue; // some servers reject HEAD but answer GET
      }
      return { url, status: response.status };
    } catch (error) {
      if (method === "HEAD") continue; // give GET a chance
      return { url, error: error instanceof Error ? error.name : String(error) };
    }
  }
  return { url, error: "unreachable" };
}

async function mapPool<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]!);
    }
  });
  await Promise.all(workers);
  return results;
}

function formatSources(pages: Set<string>): string {
  const list = [...pages].sort();
  const shown = list.slice(0, 3).join(", ");
  return list.length > 3 ? `${shown}, +${list.length - 3} more` : shown;
}

if (!existsSync(distDir)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

const entries = await readdir(distDir, { recursive: true, withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => path.join(entry.parentPath, entry.name))
  .sort();

const internalRefs: SourceMap = new Map();
const externalRefs: SourceMap = new Map();

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file);
  const route = rel.endsWith("index.html")
    ? `/${rel.slice(0, -"index.html".length)}`
    : `/${rel}`;
  const html = await readFile(file, "utf8");
  for (const ref of extractRefs(html)) {
    const classified = classify(ref, route);
    if (classified.kind === "internal") {
      addRef(internalRefs, classified.path, route);
    } else if (classified.kind === "external") {
      addRef(externalRefs, classified.url, route);
    }
  }
}

// Internal references: resolve against the dist/ file tree.
const brokenInternal: string[] = [];
for (const [ref, pages] of [...internalRefs.entries()].sort()) {
  if (resolveInternal(ref) === null) {
    brokenInternal.push(`${ref} (found on: ${formatSources(pages)})`);
  }
}

// External references: fetch with limited concurrency.
const externalUrls = [...externalRefs.keys()].sort();
console.log(
  `Checking ${externalUrls.length} unique external links ` +
    `(this may take a minute)...`,
);
const results = await mapPool(externalUrls, CONCURRENCY, fetchStatus);

const brokenExternal: string[] = [];
const warnings: string[] = [];
let okCount = 0;
for (const result of results) {
  const sources = formatSources(externalRefs.get(result.url)!);
  if (result.status !== undefined && result.status < 400) {
    okCount++;
  } else if (result.status !== undefined && BROKEN_STATUSES.has(result.status)) {
    brokenExternal.push(`${result.status} ${result.url} (found on: ${sources})`);
  } else {
    const reason = result.status !== undefined ? String(result.status) : result.error!;
    warnings.push(`${reason} ${result.url} (found on: ${sources})`);
  }
}

console.log(
  `\nCrawled ${htmlFiles.length} pages: ` +
    `${internalRefs.size} internal references, ${externalUrls.length} external links.`,
);
console.log(
  `Internal: ${internalRefs.size - brokenInternal.length} ok, ${brokenInternal.length} broken. ` +
    `External: ${okCount} ok, ${brokenExternal.length} broken, ${warnings.length} unverifiable.`,
);

if (brokenInternal.length > 0) {
  console.log("\nBroken internal references:");
  for (const entry of brokenInternal) console.log(`  ${entry}`);
}
if (brokenExternal.length > 0) {
  console.log("\nBroken external links:");
  for (const entry of brokenExternal) console.log(`  ${entry}`);
}
if (warnings.length > 0) {
  console.log(
    "\nUnverifiable external links (bot blocks, rate limits, server errors; check manually):",
  );
  for (const entry of warnings) console.log(`  ${entry}`);
}

if (brokenInternal.length > 0 || brokenExternal.length > 0) {
  process.exit(1);
}
console.log("\nNo broken links found.");
