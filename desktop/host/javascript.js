import { BrowserWindow } from "electron";

// A hidden page that may run scripts and nothing else: no requests, no images, no frames from elsewhere.
const PAGE = `data:text/html;charset=utf-8,${encodeURIComponent(
  `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-eval'">`,
)}`;
// Each engine is an isolated world of the page: its own globals, kept between scripts run as QuickJS
// runs them (a `class` or `let` stays for the next one). 999 and below are Electron's.
const FIRST_WORLD = 1000;
// executeJavaScript only says a script failed; the world's own handler keeps what it threw.
const KEEP_ERRORS = `addEventListener("error", (event) => { globalThis.__anipoexError = String(event.error ?? event.message) }); null`;
const TAKE_ERROR = `(() => { const error = globalThis.__anipoexError; globalThis.__anipoexError = undefined; return error ?? null })()`;

let engine = null;
let nextId = 0;
let open = 0;

const page = () => {
  if (!engine || engine.window.isDestroyed()) {
    const window = new BrowserWindow({
      show: false,
      webPreferences: { sandbox: true, contextIsolation: true },
    });
    // A script stays in the page: no windows, and no leaving for a site that may make requests.
    window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    window.webContents.on("will-navigate", (event) => event.preventDefault());
    engine = { window, loaded: window.loadURL(PAGE) };
  }
  return engine.loaded.then(() => engine.window.webContents);
};

const run = async (id, code) =>
  (await page()).executeJavaScriptInIsolatedWorld(FIRST_WORLD + Number(id), [
    { code },
  ]);

// What QuickJS hands back: strings, numbers, booleans and arrays of them; anything else is null.
const plain = (value) =>
  typeof value === "string" || typeof value === "boolean"
    ? value
    : typeof value === "number" && Number.isFinite(value)
      ? value
      : Array.isArray(value)
        ? value.map(plain)
        : null;

/** Opens an engine for `QuickJs.create()`; resolves to its id. */
export async function jsCreate() {
  const id = ++nextId;
  open++;
  await run(id, KEEP_ERRORS);
  return id;
}

/** Evaluates a script in an engine, as `QuickJs.evaluate`: resolves to its result, or rejects with what the script threw. */
export async function jsEvaluate({ id, script }) {
  try {
    return plain(await run(id, script));
  } catch (error) {
    // A function or a DOM object can't leave the page; QuickJS gives null for those too.
    if (/could not be cloned/.test(error.message)) return null;
    throw new Error(
      (await run(id, TAKE_ERROR).catch(() => null)) ?? error.message,
    );
  }
}

/** Closes an engine, as `QuickJs.close`; the page goes with the last one, and its worlds with it. */
export async function jsClose() {
  open = Math.max(0, open - 1);
  if (open === 0 && engine && !engine.window.isDestroyed())
    engine.window.destroy();
  return null;
}
