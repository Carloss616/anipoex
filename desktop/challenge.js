import { BrowserWindow, session } from "electron";

// Under the runtime's 2-minute call timeout, which counts the time spent here.
const SOLVE_MS = 60_000;
// A challenge that wants a click shows itself; most solve on their own before.
const SHOW_AFTER_MS = 8_000;
const POLL_MS = 500;
// A site's page stays loaded this long after its last request, then closes.
const IDLE_MS = 10 * 60_000;
// Where the clearance lives: its own session, apart from the app's, since the pages are the sources' sites.
const PARTITION = "cloudflare";

const isWebUrl = (url) =>
  ["http:", "https:"].includes(URL.parse(url ?? "")?.protocol);

const toSetCookie = (cookie) =>
  [
    `${cookie.name}=${cookie.value}`,
    cookie.hostOnly ? null : `Domain=${cookie.domain}`,
    `Path=${cookie.path}`,
    cookie.expirationDate
      ? `Expires=${new Date(cookie.expirationDate * 1000).toUTCString()}`
      : null,
  ]
    .filter(Boolean)
    .join("; ");

// Chrome's own user agent, without the app and Electron tokens a bot check looks for.
const chromeUserAgent = (userAgent) =>
  userAgent.replace(/ (anipoex-desktop|Electron)\/\S+/g, "");

// The solved site's page per host, kept to send its requests from: Cloudflare takes the
// clearance from that page's own fetch, but not from one made in the main process.
const pages = new Map();
// The solve under way per host whose page closed: a second one would destroy the first's window mid-fetch.
const reopening = new Map();

const keepPage = (host, window) => {
  const page = pages.get(host);
  if (page && page.window !== window && !page.window.isDestroyed())
    page.window.destroy();
  clearTimeout(page?.idle);
  const idle = setTimeout(() => {
    pages.delete(host);
    if (!window.isDestroyed()) window.destroy();
  }, IDLE_MS);
  pages.set(host, { window, idle });
};

/**
 * Solves a Cloudflare challenge in a window of its own session; resolves to `{cookies, userAgent}`: the cookies it earned for `url` as `Set-Cookie` values, and the user agent it solved as.
 * It solves as the desktop Chrome it is: an Android user agent on a Mac gets the interactive check. The page stays, hidden, for `fetchThrough`.
 */
export async function solveChallenge({ url }) {
  if (!isWebUrl(url)) throw new Error("Not a web URL");
  const cloudflare = session.fromPartition(PARTITION);
  await cloudflare.cookies.remove(url, "cf_clearance");
  const window = new BrowserWindow({
    show: false,
    width: 480,
    height: 640,
    title: "Verifying the site…",
    webPreferences: {
      session: cloudflare,
      sandbox: true,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  const userAgent = chromeUserAgent(window.webContents.getUserAgent());
  const show = setTimeout(() => {
    if (!window.isDestroyed()) window.show();
  }, SHOW_AFTER_MS);
  try {
    window.loadURL(url, { userAgent }).catch(() => {});
    for (const deadline = Date.now() + SOLVE_MS; Date.now() < deadline; ) {
      if (window.isDestroyed()) throw new Error("Cloudflare check closed");
      const cookies = await cloudflare.cookies.get({ url });
      if (cookies.some(({ name }) => name === "cf_clearance")) {
        // Cloudflare reloads the page once cleared, and a page's script dies with it: use it once it's the site's.
        while (
          Date.now() < deadline &&
          (window.webContents.isLoading() ||
            window.webContents.getTitle() === "Just a moment...")
        )
          await new Promise((resolve) => setTimeout(resolve, 250));
        window.hide();
        keepPage(new URL(url).host, window);
        return { cookies: cookies.map(toSetCookie), userAgent };
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
    window.destroy();
    throw new Error("Cloudflare check timed out");
  } catch (error) {
    if (
      !window.isDestroyed() &&
      pages.get(new URL(url).host)?.window !== window
    )
      window.destroy();
    throw error;
  } finally {
    clearTimeout(show);
  }
}

// Runs in the site's page: its own same-origin fetch, so the browser adds the cookies and headers
// it sends for the site itself. The body travels as base64, both ways.
async function pageFetch({ method, url, headers, body }) {
  const bytes = body
    ? Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
    : undefined;
  const response = await fetch(url, {
    method,
    headers,
    body: bytes,
    credentials: "include",
  });
  const data = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < data.length; i += 0x8000)
    binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return {
    status: response.status,
    headers: [...response.headers],
    body: btoa(binary),
  };
}

// A page's fetch refuses these; the browser sends its own.
const FORBIDDEN = new Set([
  "cookie",
  "user-agent",
  "referer",
  "host",
  "connection",
  "accept-encoding",
  "content-length",
]);

/**
 * Sends a runtime request from the page that solved its site's challenge; resolves to `{status, headers, body}` with a base64 body.
 * Some sites only take the clearance from the browser itself, not from the runtime's TLS fingerprint. The runtime's other cookies join the session's store first.
 */
export async function fetchThrough({ method, url, headers, body }) {
  if (!isWebUrl(url)) throw new Error("Not a web URL");
  const host = new URL(url).host;
  // Closed while idle: solving again reopens it, once for the requests that find it closed together.
  if (!pages.get(host) || pages.get(host).window.isDestroyed()) {
    if (!reopening.has(host))
      reopening.set(
        host,
        solveChallenge({ url }).finally(() => reopening.delete(host)),
      );
    await reopening.get(host);
  }
  const page = pages.get(host);
  keepPage(host, page.window);
  const cloudflare = session.fromPartition(PARTITION);
  const known = new Set(
    (await cloudflare.cookies.get({ url })).map(({ name }) => name),
  );
  const cookie =
    headers.find(([name]) => name.toLowerCase() === "cookie")?.[1] ?? "";
  for (const pair of cookie.split(";")) {
    const [name, ...value] = pair.trim().split("=");
    if (name && !known.has(name))
      await cloudflare.cookies.set({ url, name, value: value.join("=") });
  }
  const sent = headers.filter(([name]) => !FORBIDDEN.has(name.toLowerCase()));
  const reply = await page.window.webContents.executeJavaScript(
    `(${pageFetch})(${JSON.stringify({ method, url, headers: sent, body })})`,
  );
  return {
    ...reply,
    // fetch already decoded the body, so its encoding and length would lie.
    headers: reply.headers.filter(
      ([name]) => !["content-encoding", "content-length"].includes(name),
    ),
  };
}
