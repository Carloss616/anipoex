const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

// shortcut: dev paths (Metro and the Gradle build); a packaged app ships the web export, the jre and the server inside it.
const APP_URL = process.env.ANIPOEX_URL ?? "http://localhost:8081";
const SERVER = path.join(__dirname, "../server/build/install/extension-server");
const BUNDLED_JAVA = path.join(__dirname, "../server/build/jre/bin/java");
const JAVA = existsSync(BUNDLED_JAVA) ? BUNDLED_JAVA : "java";
// The renderer may only reach RuntimeApi through these.
const AUTH_ORIGIN = "https://anilist.co";
const METHODS = new Set(["install", "installed", "uninstall", "search", "chapters", "mangaWebUrl"]);

/** Starts the JVM extension server and returns `call(method, args)`, which resolves to `{result}` or `{error}`. */
function startSidecar() {
  const sidecar = spawn(
    JAVA,
    [
      `-Xbootclasspath/a:${path.join(SERVER, "boot/jul-shim.jar")}`,
      "-cp",
      path.join(SERVER, "lib", "*"),
      "anipoex.server.MainKt",
      path.join(app.getPath("userData"), "extensions"),
    ],
    { stdio: ["pipe", "pipe", "inherit"] },
  );
  const pending = new Map();
  let nextId = 0;
  let stopped = null;
  readline.createInterface({ input: sidecar.stdout }).on("line", (line) => {
    const reply = JSON.parse(line);
    pending.get(reply.id)?.(reply);
    pending.delete(reply.id);
  });
  const stop = (reason) => {
    stopped = `Extension server stopped: ${reason}`;
    for (const resolve of pending.values()) resolve({ error: stopped });
    pending.clear();
  };
  sidecar.on("error", (error) => stop(error.message));
  sidecar.on("exit", (code) => stop(`exit code ${code}`));
  // Closing stdin is how the server learns the app is gone.
  app.on("will-quit", () => sidecar.stdin.end());

  return (method, args) =>
    new Promise((resolve) => {
      if (stopped) return resolve({ error: stopped });
      const id = ++nextId;
      pending.set(id, resolve);
      sidecar.stdin.write(`${JSON.stringify({ id, method, args })}\n`);
    });
}

app.whenReady().then(() => {
  const call = startSidecar();
  ipcMain.handle("runtime", (event, method, args) => {
    if (new URL(event.senderFrame.url).origin !== new URL(APP_URL).origin) return { error: "Not allowed" };
    if (!METHODS.has(method)) return { error: `Unknown method ${method}` };
    return call(method, args ?? {});
  });

  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, sandbox: true },
  });
  // Links to other sites open in the browser, so the preload's bridge never runs on a page we don't serve.
  // AniList's sign-in is the exception: expo-web-browser waits for its popup to land back on our redirect page.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (new URL(url).origin === AUTH_ORIGIN) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (new URL(url).origin === new URL(APP_URL).origin) return;
    event.preventDefault();
    shell.openExternal(url);
  });
  window.loadURL(APP_URL);
});

app.on("window-all-closed", () => app.quit());
