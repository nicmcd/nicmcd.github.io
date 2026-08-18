/**
 * Cached test-suite runner (`npm run test:suite`, used by .githooks/pre-commit).
 *
 * Runs the full suite — validate, check, unit tests, build, e2e — but skips
 * any step whose input files are unchanged since that step last passed,
 * makefile-style. Instead of mtimes, each step is fingerprinted by hashing
 * the path and content of every file it depends on (tracked and untracked,
 * via `git ls-files`, so .gitignore is respected). A step re-runs exactly
 * when one of its inputs actually changed.
 *
 * Stamps live in `.test-cache/` (git-ignored). Delete that directory to
 * force a full run. On any uncertainty (no git, unreadable stamp, ...) the
 * step runs — the cache only ever skips steps proven fresh.
 *
 * Usage: `node --experimental-strip-types scripts/test-cached.ts [step ...]`
 * With no arguments, runs all steps in suite order.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

interface Step {
  /** npm script to run. */
  script: string;
  /** git pathspecs whose contents fingerprint this step. */
  inputs: string[];
}

interface Stamp {
  fingerprint: string;
  passedAt: string;
}

const CACHE_DIR = ".test-cache";

/** Dependency changes (npm ci) invalidate every step. */
const SHARED = ["package.json", "package-lock.json"];

const STEPS: Step[] = [
  {
    script: "validate",
    inputs: [
      ...SHARED,
      "astro.config.mjs",
      "src/content",
      "src/content.config.ts",
      "src/utils",
      "public",
      "scripts/validate-content.ts",
    ],
  },
  {
    script: "check",
    inputs: [
      ...SHARED,
      "tsconfig.json",
      "astro.config.mjs",
      "src",
      "tests/unit",
      "scripts",
    ],
  },
  {
    script: "test",
    inputs: [...SHARED, "tsconfig.json", "vitest.config.ts", "src", "tests/unit"],
  },
  {
    script: "build",
    inputs: [
      ...SHARED,
      "tsconfig.json",
      "astro.config.mjs",
      "src",
      "public",
      "scripts",
    ],
  },
  {
    // Runs against the build output, so it inherits the build's inputs.
    script: "test:e2e",
    inputs: [
      ...SHARED,
      "tsconfig.json",
      "astro.config.mjs",
      "playwright.config.ts",
      "src",
      "public",
      "scripts",
      "tests/e2e",
    ],
  },
];

/** Hash path + content of every input file; null when git is unavailable. */
function fingerprint(inputs: string[]): string | null {
  let out: string;
  try {
    out = execFileSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", ...inputs],
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
    );
  } catch {
    return null;
  }
  const hash = createHash("sha256");
  const files = out.split("\0").filter((f) => f.length > 0).sort();
  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    try {
      hash.update(readFileSync(file));
    } catch {
      // Tracked but deleted from the working tree: still changes the hash.
      hash.update(`missing:${file}`);
    }
    hash.update("\0");
  }
  return hash.digest("hex");
}

function stampPath(script: string): string {
  return `${CACHE_DIR}/${script.replace(/[^a-z0-9]+/gi, "-")}.json`;
}

function readStamp(script: string): Stamp | null {
  try {
    const parsed: unknown = JSON.parse(readFileSync(stampPath(script), "utf8"));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "fingerprint" in parsed &&
      "passedAt" in parsed
    ) {
      return parsed as Stamp;
    }
    return null;
  } catch {
    return null;
  }
}

function writeStamp(script: string, fingerprint: string): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  const stamp: Stamp = { fingerprint, passedAt: new Date().toISOString() };
  writeFileSync(stampPath(script), JSON.stringify(stamp) + "\n");
}

const args = process.argv.slice(2);
const selected =
  args.length === 0 ? STEPS : STEPS.filter((s) => args.includes(s.script));
if (selected.length === 0) {
  console.error(
    `Unknown step(s): ${args.join(", ")}. Available: ${STEPS.map((s) => s.script).join(", ")}`,
  );
  process.exit(2);
}

for (const step of selected) {
  const fp = fingerprint(step.inputs);
  const stamp = fp === null ? null : readStamp(step.script);
  if (fp !== null && stamp !== null && stamp.fingerprint === fp) {
    console.log(
      `==> npm run ${step.script} — unchanged since ${stamp.passedAt}, skipping`,
    );
    continue;
  }
  console.log(`==> npm run ${step.script}`);
  const result = spawnSync("npm", ["run", step.script], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`test suite failed at step: ${step.script}`);
    process.exit(result.status ?? 1);
  }
  if (fp !== null) writeStamp(step.script, fp);
}

console.log("test suite: all steps passed.");
