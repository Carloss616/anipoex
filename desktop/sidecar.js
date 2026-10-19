import { spawn } from "node:child_process";
import { closeSync, mkdirSync, openSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

/**
 * Runs the JVM extension server on demand: one JSON line per request and per reply.
 * `call` resolves to the server's `{id, result}` or `{id, error}`, or `{error}` when the process stops; the next call starts a new one.
 */
export function startSidecar({ java, args, logFile }) {
  let server = null;
  let nextId = 0;
  // The log starts empty with the app; restarts append, so a crash's stderr survives the relaunch.
  let logFlags = "w";

  const launch = () => {
    mkdirSync(path.dirname(logFile), { recursive: true });
    const log = openSync(logFile, logFlags);
    logFlags = "a";
    const child = spawn(java, args, { stdio: ["pipe", "pipe", log] });
    closeSync(log);
    const pending = new Map();
    const current = { child, pending };
    const stopped = (reason) => {
      if (server === current) server = null;
      for (const resolve of pending.values())
        resolve({ error: `Extension server stopped: ${reason}` });
      pending.clear();
    };
    child.on("error", (error) => stopped(error.message));
    // `close` waits for stdout to end, so replies written just before the exit still arrive.
    child.on("close", (code, signal) =>
      stopped(signal ? `signal ${signal}` : `exit code ${code}`),
    );
    // A dead process fails the write; its `close` already answers the pending calls.
    child.stdin.on("error", () => {});
    readline.createInterface({ input: child.stdout }).on("line", (line) => {
      const reply = JSON.parse(line);
      pending.get(reply.id)?.(reply);
      pending.delete(reply.id);
    });
    return current;
  };

  return {
    call: (method, args) =>
      new Promise((resolve) => {
        server ??= launch();
        const id = ++nextId;
        server.pending.set(id, resolve);
        server.child.stdin.write(`${JSON.stringify({ id, method, args })}\n`);
      }),
    // Closing stdin is how the server learns the app is gone.
    stop: () => server?.child.stdin.end(),
  };
}
