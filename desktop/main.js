import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { app, BrowserWindow, ipcMain, net, protocol, shell } from "electron";
import { authRedirect } from "./auth.js";
import { resolveAsset } from "./serve.js";
import { startSidecar } from "./sidecar.js";

// Packaged, electron-builder puts the web export, the server and the jre in Resources; in development they come from Metro and the Gradle build.
const BUILD = path.join(
  import.meta.dirname,
  "../modules/extension-runtime/jvm/build",
);
const PATHS = app.isPackaged
  ? {
      web: path.join(process.resourcesPath, "web"),
      server: path.join(process.resourcesPath, "server"),
      jre: path.join(process.resourcesPath, "jre"),
    }
  : {
      web: path.join(import.meta.dirname, "../dist"),
      server: path.join(BUILD, "install/extension-runtime"),
      jre: path.join(BUILD, "jre"),
    };
const APP_URL = app.isPackaged
  ? "app://anipoex/"
  : (process.env.ANIPOEX_URL ?? "http://localhost:8081");
const BUNDLED_JAVA = path.join(PATHS.jre, "bin/java");
const JAVA = existsSync(BUNDLED_JAVA) ? BUNDLED_JAVA : "java";
// The only site the sign-in window opens.
const AUTH_ORIGIN = "https://anilist.co";
// The renderer may only reach RuntimeApi through these.
const METHODS = new Set([
  "install",
  "installed",
  "uninstall",
  "search",
  "chapters",
  "mangaWebUrl",
]);

// Not `URL.origin`: a custom scheme's origin is the opaque "null", which every `data:` or `about:` frame shares.
const originOf = (url) => {
  const parsed = URL.parse(url ?? "");
  return parsed && `${parsed.protocol}//${parsed.host}`;
};
const APP_ORIGIN = originOf(APP_URL);

// Before `ready`: a standard, secure scheme gets real origins, fetch, CORS and storage like https.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

app.whenReady().then(() => {
  // `net.fetch` of the file sets the Content-Type from its extension.
  protocol.handle("app", (request) => {
    const file = resolveAsset(PATHS.web, new URL(request.url).pathname);
    return file
      ? net.fetch(pathToFileURL(file).toString())
      : new Response("Not found", { status: 404 });
  });

  const extensions = path.join(app.getPath("userData"), "extensions");
  const sidecar = startSidecar({
    java: JAVA,
    args: [
      "-Xmx512m",
      `-Xbootclasspath/a:${path.join(PATHS.server, "boot/jul-shim.jar")}`,
      "-cp",
      path.join(PATHS.server, "lib", "*"),
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

  let signInWindow;
  ipcMain.handle("sign-in", (event, url) => {
    if (
      originOf(event.senderFrame?.url) !== APP_ORIGIN ||
      originOf(url) !== AUTH_ORIGIN
    )
      return null;
    // One sign-in at a time: a second request focuses the open window and counts as cancelled.
    if (signInWindow) {
      signInWindow.focus();
      return null;
    }
    return new Promise((resolve) => {
      signInWindow = new BrowserWindow({
        parent: window,
        width: 520,
        height: 760,
        webPreferences: { contextIsolation: true, sandbox: true },
      });
      // The registered redirect is never loaded: its URL already carries the token or the error.
      const stopOnRedirect = (navigation, target) => {
        if (!authRedirect(target)) return;
        navigation.preventDefault();
        resolve(target);
        signInWindow.close();
      };
      signInWindow.webContents.on("will-redirect", stopOnRedirect);
      signInWindow.webContents.on("will-navigate", stopOnRedirect);
      signInWindow.on("closed", () => {
        signInWindow = undefined;
        resolve(null);
      });
      signInWindow.loadURL(url);
    });
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
  window.webContents.setWindowOpenHandler(({ url }) => {
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
