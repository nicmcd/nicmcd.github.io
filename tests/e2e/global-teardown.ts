import { spawnSync } from "node:child_process";

/**
 * `astro preview` daemonizes in Astro 7; make sure the background server is
 * stopped after the test run so nothing is left listening on the e2e port.
 */
export default function globalTeardown(): void {
  spawnSync("npx", ["astro", "preview", "stop"], { stdio: "inherit" });
}
