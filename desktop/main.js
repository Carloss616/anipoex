import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  app,
  BrowserWindow,
  ipcMain,
  net,
  protocol,
  session,
  shell,
} from "electron";
import { authRedirect } from "./auth.js";
import { fetchThrough, solveChallenge } from "./challenge.js";
import { coverHeaders } from "./covers.js";
import { jsClose, jsCreate, jsEvaluate } from "./javascript.js";
import { PAGE_SCHEME, pageStore, servePage } from "./pages.js";
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
  "getDns",
  "setDns",
  "pages",
]);

// Not `URL.origin`: a custom scheme's origin is the opaque "null", which every `data:` or `about:` frame shares.
const originOf = (url) => {
  const parsed = URL.parse(url ?? "");
  return parsed && `${parsed.protocol}//${parsed.host}`;
};
const APP_ORIGIN = originOf(APP_URL);
// Only web links leave the app: `file:`, custom schemes and the like would open local apps or files.
const openInBrowser = (url) => {
  if (["http:", "https:"].includes(URL.parse(url ?? "")?.protocol))
    shell.openExternal(url);
};

// A second launch would start a second sidecar on the same extension files.
const PRIMARY = app.requestSingleInstanceLock();
if (!PRIMARY) app.quit();

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
  // The renderer loads source pages through it: an `<img>` can't send the source's headers.
  {
    scheme: PAGE_SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

app.whenReady().then(() => {
  // `quit` is asynchronous, so `ready` can still arrive in the instance that is leaving.
  if (!PRIMARY) return;
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
      "-XX:+ExitOnOutOfMemoryError",
      `-Xbootclasspath/a:${path.join(PATHS.server, "boot/jul-shim.jar")}`,
      "-cp",
      path.join(PATHS.server, "lib", "*"),
      "anipoex.server.MainKt",
      extensions,
    ],
    logFile: path.join(extensions, "server.log"),
    // The runtime has no browser: a Cloudflare challenge is solved in one of ours, and that site is fetched through
    // it; nor a JavaScript engine that runs modern scripts, so extensions' run in ours.
    host: {
      solveChallenge,
      fetch: fetchThrough,
      jsCreate,
      jsEvaluate,
      jsClose,
    },
  });
  app.on("will-quit", () => sidecar.stop());

  // Covers send their source's headers, added to the <img> request: the renderer picks no URL for us to fetch.
  const covers = coverHeaders();
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ["http://*/*", "https://*/*"] },
    ({ resourceType, url, requestHeaders }, callback) =>
      callback({
        requestHeaders:
          resourceType === "image"
            ? covers.apply(url, requestHeaders)
            : requestHeaders,
      }),
  );

  // Only what `pages` returned is served, never a URL the renderer picks.
  const pages = pageStore();
  protocol.handle(PAGE_SCHEME, (request) =>
    servePage(pages, request.url, net.fetch),
  );

  ipcMain.handle("runtime", async (event, method, args) => {
    if (originOf(event.senderFrame?.url) !== APP_ORIGIN || !METHODS.has(method))
      return { error: "Not allowed" };
    const reply = await sidecar.call(method, args ?? {});
    if (method === "installed") covers.learnSources(reply?.result);
    if (method === "search") covers.learnCovers(args?.sourceId, reply?.result);
    return method === "pages" && reply?.result
      ? { result: pages.rewrite(reply.result) }
      : reply;
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
      const stopOnRedirect = (navigation) => {
        if (!navigation.isMainFrame || !authRedirect(navigation.url)) return;
        navigation.preventDefault();
        resolve(navigation.url);
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
    openInBrowser(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (originOf(url) === APP_ORIGIN) return;
    event.preventDefault();
    openInBrowser(url);
  });
  app.on("second-instance", () => {
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  window.loadURL(APP_URL);
  // The app is this window: hidden ones (a site's kept page, the script engine) don't keep it running.
  window.on("closed", () => app.quit());
});
