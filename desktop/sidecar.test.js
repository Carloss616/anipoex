import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { startSidecar } from "./sidecar.js";

// Speaks the server's protocol: `wait` replies after args.ms, `pid` names the process, `noise` prints a non-JSON line first, `crash` exits with code 1, `ask` asks the host and replies with its answer.
const FAKE_SERVER = `
const readline = require("node:readline");
const asked = new Map();
readline.createInterface({ input: process.stdin })
  .on("line", (line) => {
    const message = JSON.parse(line);
    if ("hostReply" in message) return asked.get(message.hostReply)(message);
    const { id, method, args } = message;
    const reply = (result) => process.stdout.write(JSON.stringify({ id, result }) + "\\n");
    if (method === "wait") setTimeout(() => reply(args.ms), args.ms);
    if (method === "pid") reply(process.pid);
    if (method === "noise") {
      process.stdout.write("not json\\n");
      reply("ok");
    }
    if (method === "crash") process.exit(1);
    if (method === "ask") {
      asked.set(id, ({ result, error }) => reply(error ?? result));
      process.stdout.write(JSON.stringify({ host: args.host, id, args: args.args }) + "\\n");
    }
  })
  .on("close", () => {
    process.stderr.write("stdin closed\\n");
    process.exit(0);
  });
`;

const sidecars = [];

const fake = (java = process.execPath, host) => {
  const logFile = path.join(
    mkdtempSync(path.join(tmpdir(), "sidecar-")),
    "extensions",
    "server.log",
  );
  const sidecar = startSidecar({
    java,
    args: ["-e", FAKE_SERVER],
    logFile,
    host,
  });
  sidecars.push(sidecar);
  return { ...sidecar, logFile };
};

afterEach(() => {
  for (const sidecar of sidecars.splice(0)) sidecar.stop();
});

describe("startSidecar", () => {
  test("answersHostCalls", async () => {
    const { call } = fake(process.execPath, {
      solveChallenge: async ({ url }) => [`cf_clearance=1; Domain=${url}`],
    });
    expect(
      await call("ask", { host: "solveChallenge", args: { url: "x.test" } }),
    ).toEqual({ id: 1, result: ["cf_clearance=1; Domain=x.test"] });
    expect(await call("ask", { host: "nope", args: {} })).toEqual({
      id: 2,
      result: "Unknown host method nope",
    });
  });

  test("outOfOrder", async () => {
    const { call } = fake();
    const order = [];
    const slow = call("wait", { ms: 200 }).then((reply) => order.push(reply));
    const fast = call("wait", { ms: 0 }).then((reply) => order.push(reply));
    await Promise.all([slow, fast]);
    expect(order).toEqual([
      { id: 2, result: 0 },
      { id: 1, result: 200 },
    ]);
  });

  test("crashResolvesPending", async () => {
    const { call } = fake();
    const waiting = call("wait", { ms: 10_000 });
    const crash = await call("crash", {});
    expect(crash.error).toStartWith("Extension server stopped");
    expect((await waiting).error).toStartWith("Extension server stopped");
  });

  test("restartsAfterCrash", async () => {
    const { call } = fake();
    const before = (await call("pid", {})).result;
    await call("crash", {});
    const after = (await call("pid", {})).result;
    expect(after).toBeNumber();
    expect(after).not.toBe(before);
  });

  test("ignoresNonJsonLines", async () => {
    const { call } = fake();
    expect(await call("noise", {})).toEqual({ id: 1, result: "ok" });
  });

  test("missingJava", async () => {
    const { call } = fake("/nonexistent");
    const reply = await call("pid", {});
    expect(reply.error).toStartWith("Extension server stopped");
  });

  test("stopClosesStdin", async () => {
    const { call, stop, logFile } = fake();
    const waiting = call("wait", { ms: 10_000 });
    stop();
    expect(await waiting).toEqual({
      error: "Extension server stopped: exit code 0",
    });
    expect(readFileSync(logFile, "utf8")).toBe("stdin closed\n");
  });
});
