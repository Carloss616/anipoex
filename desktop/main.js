import { existsSync } from "node:fs";
import path from "node:path";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { startSidecar } from "./sidecar.js";

// shortcut: dev paths (Metro and the Gradle build); a packaged app ships the web export, the jre and the server inside it.
const APP_URL = process.env.ANIPOEX_URL ?? "http://localhost:8081";
const APP_ORIGIN = new URL(APP_URL).origin;
const BUILD = path.join(
  import.meta.dirname,
  "../modules/extension-runtime/jvm/build",
);
const SERVER = path.join(BUILD, "install/extension-runtime");
const BUNDLED_JAVA = path.join(BUILD, "jre/bin/java");
const JAVA = existsSync(BUNDLED_JAVA) ? BUNDLED_JAVA : "java";
// The renderer may only reach RuntimeApi through these.
const AUTH_ORIGIN = "https://anilist.co";
const METHODS = new Set([
  "install",
  "installed",
  "uninstall",
  "search",
  "chapters",
  "mangaWebUrl",
]);

const originOf = (url) => URL.parse(url ?? "")?.origin;

app.whenReady().then(() => {
  const extensions = path.join(app.getPath("userData"), "extensions");
  const sidecar = startSidecar({
    java: JAVA,
    args: [
      "-Xmx512m",
      `-Xbootclasspath/a:${path.join(SERVER, "boot/jul-shim.jar")}`,
      "-cp",
      path.join(SERVER, "lib", "*"),
      "anipoex.server.MainKt",
      extensions,
    ],
    logFile: path.join(extensions, "server.log"),
  });
  app.on("will-quit", () => sidecar.stop());

  ipcMain.handle("runtime", (event, method, args) => {
    if (originOf(event.senderFrame?.url) !== APP_ORIGIN || !METHODS.has(method))
      return { error: "Not allowed" };
    return sidecar.call(method, args ?? {});
  });

  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
    },
  });
  // Links to other sites open in the browser, so the preload's bridge never runs on a page we don't serve.
  // AniList's sign-in is the exception: expo-web-browser waits for its popup to land back on our redirect page.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (originOf(url) === AUTH_ORIGIN) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (originOf(url) === APP_ORIGIN) return;
    event.preventDefault();
    shell.openExternal(url);
  });
  window.loadURL(APP_URL);
});

app.on("window-all-closed", () => app.quit());
