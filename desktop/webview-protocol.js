// The WebView protocol's shapes to and from Electron's, apart so they test without Electron.

export const CONSOLE_LEVELS = {
  info: "log",
  warning: "warn",
  error: "error",
  debug: "debug",
};

/** An Electron cookie as the protocol's `{name, value, domain, path, expiresAt, secure, httpOnly, hostOnly}`. */
export const toCookie = ({
  name,
  value,
  domain,
  path,
  expirationDate,
  secure,
  httpOnly,
  hostOnly,
}) => ({
  name,
  value,
  domain: domain.replace(/^\./, ""),
  path,
  expiresAt: expirationDate ? Math.round(expirationDate * 1000) : null,
  secure,
  httpOnly,
  hostOnly,
});

/** A protocol cookie as `session.cookies.set`'s details: a host-only one names no domain. */
export const toElectronCookie = (cookie) => {
  const domain = cookie.domain.replace(/^\./, "");
  const path = cookie.path || "/";
  return {
    url: `${cookie.secure ? "https" : "http"}://${domain}${path}`,
    name: cookie.name,
    value: cookie.value,
    domain: cookie.hostOnly ? undefined : domain,
    path,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
    expirationDate:
      cookie.expiresAt == null ? undefined : cookie.expiresAt / 1000,
  };
};

/** `wvRespond`'s `{status, reason, mimeType, encoding, headers, body}` as CDP's `Fetch.fulfillRequest` params. */
export const toFulfill = ({
  status,
  reason,
  mimeType,
  encoding,
  headers,
  body,
}) => {
  const all = Object.entries(headers ?? {}).filter(
    ([name]) => !mimeType || name.toLowerCase() !== "content-type",
  );
  if (mimeType)
    all.push([
      "Content-Type",
      encoding ? `${mimeType}; charset=${encoding}` : mimeType,
    ]);
  return {
    responseCode: status || 200,
    responsePhrase: reason || undefined,
    responseHeaders: all.map(([name, value]) => ({
      name,
      value: String(value),
    })),
    body: body ?? "",
  };
};

// Chromium's GREASE brand for a major version (user_agent_utils.cc), so a forged list reads like a real one.
const GREASE_CHARS = [" ", "(", ":", "-", ".", "/", ")", ";", "=", "?", "_"];
const GREASE_VERSIONS = ["8", "99", "24"];
const ORDERS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

const brandList = (major, full) => {
  const grease = {
    brand: `Not${GREASE_CHARS[major % 11]}A${GREASE_CHARS[(major + 1) % 11]}Brand`,
    version: GREASE_VERSIONS[major % 3],
  };
  const list = [
    { ...grease, version: full ? `${grease.version}.0.0.0` : grease.version },
    { brand: "Chromium", version: full ?? String(major) },
    { brand: "Google Chrome", version: full ?? String(major) },
  ];
  const shuffled = [];
  for (const [index, at] of ORDERS[major % 6].entries())
    shuffled[at] = list[index];
  return shuffled;
};

/**
 * `Emulation.setUserAgentOverride` params for an extension's user agent: client hints and `navigator.platform` told
 * from it, as Android's helper does, since a UA its client hints contradict fails bot checks. A non-Chrome UA gets
 * none, as such browsers send none.
 */
export const uaOverride = (userAgent) => {
  const chrome = /Chrome\/(\d+)(\.[\d.]+)?/.exec(userAgent);
  const android = /Android ([\d.]+)(?:; ([^;)]+))?/.exec(userAgent);
  const [platform, platformVersion, navigatorPlatform, architecture] = android
    ? ["Android", android[1], "Linux armv81", ""]
    : /Windows NT/.test(userAgent)
      ? ["Windows", "10.0.0", "Win32", "x86"]
      : /Mac OS X/.test(userAgent)
        ? [
            "macOS",
            /Mac OS X ([\d_]+)/.exec(userAgent)?.[1].replaceAll("_", ".") ?? "",
            "MacIntel",
            "arm",
          ]
        : /CrOS/.test(userAgent)
          ? ["Chrome OS", "", "Linux x86_64", "x86"]
          : ["Linux", "", "Linux x86_64", "x86"];
  if (!chrome) return { userAgent, platform: navigatorPlatform };
  const major = Number(chrome[1]);
  const full = `${major}${chrome[2] ?? ".0.0.0"}`;
  const mobile = /Mobile/.test(userAgent);
  return {
    userAgent,
    platform: navigatorPlatform,
    userAgentMetadata: {
      brands: brandList(major),
      fullVersionList: brandList(major, full),
      fullVersion: full,
      platform,
      platformVersion,
      architecture,
      model: android?.[2]?.replace(/ Build\/.*/, "") ?? "",
      mobile,
      bitness: android ? "" : "64",
      wow64: false,
    },
  };
};

/** `wvLoadData`'s document as a data URL; Android's `encoding` is a charset, or "base64" for already encoded data. */
export const dataUrl = (data, mimeType, encoding) =>
  encoding?.toLowerCase() === "base64"
    ? `data:${mimeType || "text/html"};base64,${data}`
    : `data:${mimeType || "text/html"};charset=${encoding || "utf-8"},${encodeURIComponent(data)}`;
