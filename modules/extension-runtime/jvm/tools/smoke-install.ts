// Usage: bun smoke-install.ts <index.json url> <count> <seed>
// Installs a seeded sample of a v2 extension index into a fresh server and prints how many installed, with errors grouped.
import { mkdtempSync, openSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const IN_FLIGHT = 5;
const jvm = join(import.meta.dir, "..");
const install = join(jvm, "build/install/extension-runtime");

type Entry = {
  name: string;
  packageName: string;
  resources: { apkUrl: string };
};
type Index = {
  signingKey: string;
  extensionList: { extensions: Entry[] };
};
type Reply = { id: number | null; result?: unknown; error?: string };

const [indexUrl, countArg, seedArg] = process.argv.slice(2);
if (!indexUrl || !countArg || !seedArg) {
  console.error("Usage: bun smoke-install.ts <index.json url> <count> <seed>");
  process.exit(2);
}

// mulberry32: small seeded PRNG so a run can be repeated.
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const index = (await (await fetch(indexUrl)).json()) as Index;
const pool = [...index.extensionList.extensions];
const random = prng(Number(seedArg));
const count = Math.min(Number(countArg), pool.length);
for (let i = 0; i < count; i++) {
  const j = i + Math.floor(random() * (pool.length - i));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}
const sample = pool.slice(0, count);

const dataDir = mkdtempSync(join(tmpdir(), "smoke-install-"));
const logPath = join(dataDir, "server.log");
const server = Bun.spawn(
  [
    join(jvm, "build/jre/bin/java"),
    "-Xmx512m",
    `-Xbootclasspath/a:${join(install, "boot/jul-shim.jar")}`,
    "-cp",
    join(install, "lib/*"),
    "anipoex.server.MainKt",
    join(dataDir, "data"),
  ],
  { stdin: "pipe", stdout: "pipe", stderr: openSync(logPath, "w") },
);

const waiting = new Map<number, (reply: Reply) => void>();
let badLines = 0;
const reading = (async () => {
  const decoder = new TextDecoder();
  let buffer = "";
  const handle = (line: string) => {
    if (!line.trim()) return;
    try {
      const reply = JSON.parse(line) as Reply;
      if (reply.id != null) waiting.get(reply.id)?.(reply);
    } catch {
      badLines++;
      console.error(`stdout line is not JSON: ${line.slice(0, 200)}`);
    }
  };
  for await (const chunk of server.stdout) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) handle(line);
  }
  handle(buffer);
  // The server is gone: whatever is still waiting will not be answered.
  for (const resolve of waiting.values())
    resolve({ id: null, error: "server exited" });
})();

let nextId = 1;
function send(method: string, args: object) {
  const id = nextId++;
  const reply = new Promise<Reply>((resolve) => waiting.set(id, resolve));
  server.stdin.write(`${JSON.stringify({ id, method, args })}\n`);
  server.stdin.flush();
  return reply;
}

// Package names and numbers vary per extension; the rest of the first line is the cause.
function normalize(error: string) {
  return (error.split("\n")[0] ?? "")
    .replace(/eu\.kanade\.tachiyomi\.extension\.[\w.$]+/g, "<pkg>")
    .replace(/\d+/g, "N")
    .slice(0, 200);
}

const started = Date.now();
const errors = new Map<string, string[]>();
let ok = 0;
let next = 0;
async function worker() {
  while (next < sample.length) {
    const entry = sample[next++];
    const reply = await send("install", {
      apkUrl: new URL(entry.resources.apkUrl, indexUrl).href,
      signingKey: index.signingKey,
    });
    if (reply.error === undefined) {
      ok++;
    } else {
      const key = normalize(reply.error);
      errors.set(key, [...(errors.get(key) ?? []), entry.packageName]);
    }
  }
}
await Promise.all(Array.from({ length: IN_FLIGHT }, worker));

server.stdin.end();
await reading;
await server.exited;

console.log(
  `${ok}/${sample.length} installed in ${Math.round((Date.now() - started) / 1000)}s`,
);
for (const [error, packages] of [...errors].sort(
  (a, b) => b[1].length - a[1].length,
)) {
  console.log(`  ${packages.length}x ${error}`);
}
console.log(`server log: ${logPath}`);
if (badLines > 0) {
  console.error(`${badLines} stdout line(s) were not JSON`);
  process.exit(1);
}
