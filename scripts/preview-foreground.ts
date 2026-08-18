/**
 * Foreground wrapper around `astro preview`.
 *
 * Astro 7's `astro preview` daemonizes itself and exits immediately, which
 * breaks tools (like Playwright's webServer) that expect a long-running
 * foreground process. This wrapper starts the background preview server,
 * waits until it responds, then stays alive until it receives a termination
 * signal, at which point it stops the background server and exits.
 */
import { spawn, spawnSync } from "node:child_process";

// Defaults to the dedicated e2e port (4421), keeping clear of dev/preview
// servers on Astro's default port 4321. Playwright sets PORT explicitly.
const PORT = process.env.PORT ?? "4421";
const URL = `http://localhost:${PORT}/`;
const START_TIMEOUT_MS = 60_000;

function runAstro(args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["astro", ...args], { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(URL);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not respond at ${URL} in time`);
}

function stopServer(): void {
  spawnSync("npx", ["astro", "preview", "stop"], { stdio: "inherit" });
}

// Always start from a clean slate.
stopServer();

const code = await runAstro(["preview", "--port", PORT]);
if (code !== 0) {
  console.error(`astro preview exited with code ${code}`);
  process.exit(code);
}

await waitForServer();
console.log(`Preview server ready at ${URL}`);

let stopping = false;
function shutdown(): void {
  if (stopping) return;
  stopping = true;
  stopServer();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Keep the event loop alive until a signal arrives.
setInterval(() => {}, 1 << 30);
