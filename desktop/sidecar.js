import { spawn } from "node:child_process";
import { closeSync, mkdirSync, openSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

/**
 * Runs the JVM extension server on demand, one JSON line per request and reply: `call` resolves to `{id, result}`, `{id, error}`, or `{error}` when the process stops (the next call starts a new one).
 * The server can ask back with a `{host, id, args}` line: `host[method](args)` answers it as `{hostReply: id, result}` or `{hostReply: id, error}`.
 * `onStop` runs each time the process stops, so what the host lent it (its pages) goes with it.
 */
export function startSidecar({ java, args, logFile, host = {}, onStop }) {
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
      onStop?.();
    };
    child.on("error", (error) => stopped(error.message));
    // `close` waits for stdout to end, so replies written just before the exit still arrive.
    child.on("close", (code, signal) =>
      stopped(signal ? `signal ${signal}` : `exit code ${code}`),
    );
    // A dead process fails the write; its `close` already answers the pending calls.
    child.stdin.on("error", () => {});
    readline.createInterface({ input: child.stdout }).on("line", (line) => {
      let reply;
      // The JVM itself can print to stdout (a fatal-error banner); those lines aren't replies.
      try {
        reply = JSON.parse(line);
      } catch {
        return;
      }
      if (typeof reply?.host === "string") {
        answerHost(child, reply);
        return;
      }
      pending.get(reply?.id)?.(reply);
      pending.delete(reply?.id);
    });
    return current;
  };

  const answerHost = async (child, { host: method, id, args }) => {
    let answer;
    try {
      const handler = Object.hasOwn(host, method) ? host[method] : undefined;
      if (!handler) throw new Error(`Unknown host method ${method}`);
      answer = { hostReply: id, result: await handler(args) };
    } catch (error) {
      answer = { hostReply: id, error: error?.message ?? String(error) };
    }
    child.stdin.write(`${JSON.stringify(answer)}\n`);
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
