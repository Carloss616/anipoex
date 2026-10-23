import path from "node:path";
import { BrowserWindow, session } from "electron";
import {
  CONSOLE_LEVELS,
  dataUrl,
  toCookie,
  toElectronCookie,
  toFulfill,
  uaOverride,
} from "./webview-protocol.js";

// Under the runtime's call timeout: a poll with nothing to say answers empty after this.
const POLL_MS = 20_000;
const PRELOAD = path.join(import.meta.dirname, "webview-preload.cjs");
// A common Android phone's, in CSS pixels.
const PHONE_SCREEN = {
  width: 412,
  height: 915,
  deviceScaleFactor: 2.625,
  mobile: true,
};
// Chromium's ERR_ABORTED: a stop or a newer navigation, which Android doesn't report.
const ABORTED = -3;

const views = new Map();
// Chromium's causes for a cookie that is gone, not replaced by a newer one.
const DELETED = new Set(["explicit", "expired", "expired-overwrite"]);
let nextId = 0;
let shared = null;

const cookieKey = ({ name, value, domain, path }) =>
  [name, value, domain.replace(/^\./, ""), path].join("\t");

const isWebUrl = (url) =>
  ["http:", "https:"].includes(URL.parse(url ?? "")?.protocol);

const emit = (view, event) => {
  // Nothing before the runtime's first load: the blank page a window starts on isn't one of its.
  if (view.closed || !view.loaded) return;
  view.queue.push(event);
  view.wake?.();
};

const live = (id) => {
  const view = views.get(id);
  if (!view || view.closed) throw new Error(`No WebView ${id}`);
  return view;
};

// One session for every WebView, as Android's CookieManager and storage are the app's, apart from the app's own.
const partition = () => {
  if (shared) return shared;
  shared = session.fromPartition("webview");
  // A page nobody sees asks nobody: no permissions, no save dialogs.
  shared.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  shared.on("will-download", (_event, item) => item.cancel());
  // Android's CookieManager is the WebView's own store, so a cookie a page sets after it finished loading (a
  // captcha's answer) is the runtime's at once; here it learns it from this event (not in the first protocol).
  // A deleted one goes as already expired, which drops it there too.
  shared.cookies.on("changed", (_event, cookie, cause, removed) => {
    if (removed && !DELETED.has(cause)) return;
    const sent = removed
      ? { ...toCookie(cookie), expiresAt: 0 }
      : toCookie(cookie);
    for (const view of views.values())
      emit(view, { type: "cookies", cookies: [sent] });
  });
  // A frame's failure reaches did-fail-load; a sub-resource's only shows here.
  shared.webRequest.onErrorOccurred(
    ({ webContentsId, resourceType, url, error }) => {
      const view = [...views.values()].find(
        ({ window }) =>
          !window.isDestroyed() && window.webContents.id === webContentsId,
      );
      if (
        view &&
        !["mainFrame", "subFrame"].includes(resourceType) &&
        // Aborted by a newer load, or an image blockImages refused: neither is a failure on Android.
        !["net::ERR_ABORTED", "net::ERR_BLOCKED_BY_CLIENT"].includes(error)
      )
        emit(view, {
          type: "error",
          url,
          description: error,
          mainFrame: false,
        });
    },
  );
  return shared;
};

// Interception goes through the DevTools protocol's Fetch domain, not protocol.handle: a request the runtime lets
// through then leaves from Chromium's own network stack (its Sec-Fetch-*, SameSite and partitioned cookies),
// where one forwarded from a handler reads as Sec-Fetch-Site "none" and fails Cloudflare's Turnstile. The page,
// its out-of-process frames and its workers are each a debugger target, set up alike; the page's own messages
// come with an empty session id, which a command refuses.
const cdp = async (view, method, params, sessionId) =>
  view.window.webContents.debugger.sendCommand(
    method,
    params,
    sessionId || undefined,
  );

const applySettings = (view, sessionId) => {
  const { userAgent, javaScriptEnabled } = view.settings;
  // A phone's user agent on a page without touch or a phone's screen fails Turnstile: it gets both.
  const phone = /Mobile/.test(userAgent ?? "");
  const send = (method, params = {}) => cdp(view, method, params, sessionId);
  return Promise.allSettled([
    // An empty user agent lifts the override: the browser's own, with its own client hints.
    send(
      "Emulation.setUserAgentOverride",
      userAgent ? uaOverride(userAgent) : { userAgent: "" },
    ),
    send("Emulation.setTouchEmulationEnabled", {
      enabled: phone,
      maxTouchPoints: phone ? 5 : undefined,
    }),
    phone
      ? send("Emulation.setDeviceMetricsOverride", PHONE_SCREEN)
      : send("Emulation.clearDeviceMetricsOverride"),
    send("Emulation.setScriptExecutionDisabled", {
      value: javaScriptEnabled === false,
    }),
  ]);
};

const setUpTarget = (view, sessionId) =>
  Promise.allSettled([
    cdp(view, "Fetch.enable", { patterns: [{ urlPattern: "*" }] }, sessionId),
    cdp(
      view,
      "Target.setAutoAttach",
      { autoAttach: true, waitForDebuggerOnStart: true, flatten: true },
      sessionId,
    ),
    applySettings(view, sessionId),
  ]);

// Every request of the page waits for the runtime's `wvRespond`: its response, or null to send it as is.
const intercept = async (view, sessionId, paused) => {
  const { requestId: pausedId, request, frameId, resourceType } = paused;
  const send = (method, params = {}) =>
    cdp(view, method, { requestId: pausedId, ...params }, sessionId).catch(
      () => {},
    );
  if (!isWebUrl(request.url)) return send("Fetch.continueRequest");
  if (view.settings.blockImages && resourceType === "Image")
    return send("Fetch.failRequest", { errorReason: "BlockedByClient" });
  const requestId = ++view.nextRequest;
  const answer = new Promise((resolve) =>
    view.requests.set(requestId, resolve),
  );
  emit(view, {
    type: "request",
    requestId,
    url: request.url + (request.urlFragment ?? ""),
    method: request.method,
    headers: request.headers,
    mainFrame: resourceType === "Document" && frameId === view.mainFrameId,
  });
  const response = await answer;
  if (view.closed) return;
  if (!response) return send("Fetch.continueRequest");
  send("Fetch.fulfillRequest", toFulfill(response));
};

const debug = async (view) => {
  const debuggee = view.window.webContents.debugger;
  debuggee.attach("1.3");
  debuggee.on("message", (_event, method, params, sessionId) => {
    if (method === "Fetch.requestPaused") intercept(view, sessionId, params);
    else if (method === "Target.attachedToTarget") {
      view.targets.add(params.sessionId);
      setUpTarget(view, params.sessionId).then(() =>
        cdp(
          view,
          "Runtime.runIfWaitingForDebugger",
          {},
          params.sessionId,
        ).catch(() => {}),
      );
    } else if (method === "Target.detachedFromTarget")
      view.targets.delete(params.sessionId);
  });
  view.mainFrameId = (
    await cdp(view, "Target.getTargetInfo", {})
  ).targetInfo.targetId;
  await setUpTarget(view, undefined);
};

// Every load starts with the runtime's cookies (its CookieManager is the store all sources share) and settings.
const prepare = async (view, settings, cookies) => {
  view.settings = settings;
  view.loaded = true;
  // The runtime sends its whole store each time: only what the browser lacks is set.
  const held = new Set((await partition().cookies.get({})).map(cookieKey));
  await Promise.all([
    ...[undefined, ...view.targets].map((target) =>
      applySettings(view, target),
    ),
    ...(cookies ?? [])
      .filter((cookie) => !held.has(cookieKey(cookie)))
      .map((cookie) =>
        // The browser refuses what it wouldn't take from a site either (a Secure cookie for http).
        partition()
          .cookies.set(toElectronCookie(cookie))
          .catch(() => {}),
      ),
  ]);
};

const watch = (view) => {
  const contents = view.window.webContents;
  // A loaded document's URL is its data URL; the page and its origin are the base URL's.
  const pageUrl = (url) =>
    url.startsWith("data:") && view.baseUrl ? view.baseUrl : url;
  contents.on(
    "did-start-navigation",
    ({ url, isMainFrame, isSameDocument }) => {
      if (isMainFrame && !isSameDocument)
        emit(view, { type: "pageStarted", url: pageUrl(url) });
    },
  );
  contents.on("did-finish-load", async () => {
    const url = pageUrl(contents.getURL());
    const cookies = isWebUrl(url)
      ? await partition()
          .cookies.get({ url })
          .catch(() => [])
      : [];
    emit(view, { type: "pageFinished", url, cookies: cookies.map(toCookie) });
  });
  contents.on(
    "did-fail-load",
    (_event, code, description, url, isMainFrame) => {
      if (code === ABORTED) return;
      emit(view, {
        type: "error",
        url,
        // As Android words it.
        description: `net::${description}`,
        mainFrame: isMainFrame,
      });
    },
  );
  contents.on("console-message", ({ level, message, sourceId, lineNumber }) =>
    emit(view, {
      type: "console",
      level: CONSOLE_LEVELS[level] ?? "log",
      message,
      source: sourceId,
      line: lineNumber,
    }),
  );
  contents.on("render-process-gone", (_event, { reason }) =>
    emit(view, {
      type: "gone",
      crashed: !["clean-exit", "killed", "oom"].includes(reason),
    }),
  );
  // `ipc` hears this page only: its preload asks for the interfaces on each navigation, then calls them.
  contents.ipc.on("webview-interfaces", (event) => {
    event.returnValue = view.settings.interfaces ?? [];
  });
  contents.ipc.on("webview-js", (_event, name, method, args) => {
    const known = (view.settings.interfaces ?? []).some(
      (face) => face.name === name && face.methods.includes(method),
    );
    if (!known || !Array.isArray(args)) return;
    // The IPC can beat the store's change event: a cookie the page set just before the call goes first.
    view.calls = (view.calls ?? Promise.resolve()).then(async () => {
      const cookies = await partition()
        .cookies.get({})
        .catch(() => []);
      emit(view, { type: "cookies", cookies: cookies.map(toCookie) });
      emit(view, { type: "js", name, method, args: args.map(String) });
    });
  });
};

/** `wvCreate`: a hidden page for an extension's WebView. */
export async function wvCreate() {
  const id = ++nextId;
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      session: partition(),
      preload: PRELOAD,
      sandbox: true,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });
  window.webContents.setAudioMuted(true);
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  const view = {
    id,
    window,
    // Never rewritten unless an extension asks: a doctored user agent fails bot checks.
    userAgent: window.webContents.getUserAgent(),
    settings: { interfaces: [] },
    baseUrl: null,
    queue: [],
    wake: null,
    closed: false,
    loaded: false,
    nextRequest: 0,
    requests: new Map(),
    targets: new Set(),
    mainFrameId: null,
  };
  views.set(id, view);
  watch(view);
  // Emulation waits for a renderer, which a window gets with its first page.
  await window.loadURL("about:blank");
  await debug(view);
  return { id, userAgent: view.userAgent };
}

/** `wvLoad`: answers once the navigation is under way; how it goes arrives as events. */
export async function wvLoad({ id, url, headers, settings, cookies }) {
  const view = live(id);
  // Never `file:` and the like: a page that reads local files would hand them to the extension.
  if (!isWebUrl(url) && !/^(about|data):/.test(url))
    throw new Error("Not a web URL");
  await prepare(view, settings, cookies);
  view.baseUrl = null;
  const { referer, ...rest } = Object.fromEntries(
    Object.entries(headers ?? {}).map(([name, value]) => [
      name.toLowerCase() === "referer" ? "referer" : name,
      value,
    ]),
  );
  view.window.webContents
    .loadURL(url, {
      // Chromium drops a Referer in extraHeaders.
      httpReferrer: referer,
      extraHeaders: Object.entries(rest)
        .map(([name, value]) => `${name}: ${value}\n`)
        .join(""),
    })
    .catch(() => {});
  return null;
}

/** `wvLoadData`: `data` as the document of `baseUrl`, which is never fetched. */
export async function wvLoadData({
  id,
  baseUrl,
  data,
  mimeType,
  encoding,
  settings,
  cookies,
}) {
  const view = live(id);
  await prepare(view, settings, cookies);
  view.baseUrl = baseUrl || null;
  view.window.webContents
    .loadURL(
      dataUrl(data, mimeType, encoding),
      view.baseUrl ? { baseURLForDataURL: view.baseUrl } : {},
    )
    .catch(() => {});
  return null;
}

/**
 * `wvEvaluate`, as Android's `evaluateJavascript`: the completion value JSON-encoded, never waiting for a promise
 * ("{}", as a DOM node gives); "null" for undefined, what JSON can't hold or a thrown error. Through the debugger,
 * since executeJavaScript awaits promises, and in the page a site's CSP may refuse the eval that encoding needs.
 */
export async function wvEvaluate({ id, script }) {
  const view = live(id);
  try {
    const { result, exceptionDetails } = await cdp(view, "Runtime.evaluate", {
      expression: script,
      returnByValue: true,
      awaitPromise: false,
    });
    // The debugger hands a function over as {}; Android gives null.
    return exceptionDetails || result.type === "function"
      ? "null"
      : (JSON.stringify(result.value) ?? "null");
  } catch {
    // A value the debugger can't hand over by value (a function, a window).
    return "null";
  }
}

export async function wvStop({ id }) {
  live(id).window.webContents.stop();
  return null;
}

/** `wvDestroy`: closes the page; a later `wvEvents` answers closed, as for any unknown id. */
export async function wvDestroy({ id }) {
  const view = views.get(id);
  if (!view || view.closed) return null;
  views.delete(id);
  view.closed = true;
  for (const resolve of view.requests.values()) resolve(null);
  view.window.destroy();
  view.wake?.();
  return null;
}

/** Closes every page: the runtime that drove them stopped, and a new one never asks for them. */
export async function wvDestroyAll() {
  await Promise.all([...views.keys()].map((id) => wvDestroy({ id })));
}

/** `wvEvents`: what's queued, or waits for something up to POLL_MS; `closed` once destroyed (a pending poll still gets what was queued). */
export async function wvEvents({ id }) {
  const view = views.get(id);
  if (!view) return { events: [], closed: true };
  if (view.queue.length === 0 && !view.closed) {
    // A newer poll takes over; the older one answers empty.
    view.wake?.();
    await new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        view.wake = null;
        resolve();
      };
      const timer = setTimeout(done, POLL_MS);
      view.wake = done;
    });
  }
  const events = view.queue.splice(0);
  return { events, closed: view.closed };
}

/** `wvRespond`: releases a held `request`. */
export async function wvRespond({ id, requestId, response }) {
  const requests = views.get(id)?.requests;
  requests?.get(requestId)?.(response ?? null);
  requests?.delete(requestId);
  return null;
}
