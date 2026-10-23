import { expect, test } from "bun:test";
import {
  dataUrl,
  toCookie,
  toElectronCookie,
  toFulfill,
  uaOverride,
} from "./webview-protocol.js";

const COOKIE = {
  name: "a",
  value: "1",
  domain: "site.test",
  path: "/",
  expiresAt: 1_700_000_000_000,
  secure: true,
  httpOnly: true,
  hostOnly: false,
};

test("cookieRoundTripsThroughElectronsShape", () => {
  const set = toElectronCookie(COOKIE);
  expect(set).toMatchObject({
    url: "https://site.test/",
    domain: "site.test",
    expirationDate: 1_700_000_000,
  });
  expect(toCookie({ ...set, domain: ".site.test", hostOnly: false })).toEqual(
    COOKIE,
  );
});

test("hostOnlyAndSessionCookiesNameNoDomainOrExpiry", () => {
  const set = toElectronCookie({
    ...COOKIE,
    hostOnly: true,
    expiresAt: null,
    secure: false,
  });
  expect(set.url).toBe("http://site.test/");
  expect(set.domain).toBeUndefined();
  expect(set.expirationDate).toBeUndefined();
  expect(
    toCookie({ ...set, domain: "site.test", hostOnly: true }).expiresAt,
  ).toBeNull();
});

test("fulfillTakesItsContentTypeFromMimeTypeAndEncoding", () => {
  expect(
    toFulfill({
      status: 201,
      reason: "Made",
      mimeType: "text/plain",
      encoding: "utf-8",
      headers: { "Content-Type": "x/y", "X-A": "b" },
      body: "aGk=",
    }),
  ).toEqual({
    responseCode: 201,
    responsePhrase: "Made",
    responseHeaders: [
      { name: "X-A", value: "b" },
      { name: "Content-Type", value: "text/plain; charset=utf-8" },
    ],
    body: "aGk=",
  });
  expect(toFulfill({ headers: {}, body: null }).responseCode).toBe(200);
});

const PHONE =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36";

test("phoneUserAgentGetsMatchingClientHints", () => {
  const { userAgent, platform, userAgentMetadata } = uaOverride(PHONE);
  expect(userAgent).toBe(PHONE);
  expect(platform).toBe("Linux armv81");
  expect(userAgentMetadata).toMatchObject({
    platform: "Android",
    platformVersion: "10",
    model: "K",
    mobile: true,
    fullVersion: "149.0.0.0",
  });
  // Chromium's own GREASE brand for 149.
  expect(userAgentMetadata.brands).toContainEqual({
    brand: "Not)A;Brand",
    version: "24",
  });
  expect(userAgentMetadata.fullVersionList).toContainEqual({
    brand: "Google Chrome",
    version: "149.0.0.0",
  });
});

test("desktopChromeAndOtherBrowsers", () => {
  const mac = uaOverride(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.167 Safari/537.36",
  );
  expect(mac.platform).toBe("MacIntel");
  expect(mac.userAgentMetadata).toMatchObject({
    platform: "macOS",
    platformVersion: "10.15.7",
    mobile: false,
    fullVersion: "152.0.7977.167",
  });
  // The GREASE brand Electron 44 itself sends for Chrome 152.
  expect(mac.userAgentMetadata.brands).toContainEqual({
    brand: "Not?A_Brand",
    version: "24",
  });
  const firefox = uaOverride(
    "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
  );
  expect(firefox.userAgentMetadata).toBeUndefined();
});

test("dataUrlEncodesTextOrKeepsBase64", () => {
  expect(dataUrl("<p>a b</p>", null, null)).toBe(
    "data:text/html;charset=utf-8,%3Cp%3Ea%20b%3C%2Fp%3E",
  );
  expect(dataUrl("PHA+", "text/html", "base64")).toBe(
    "data:text/html;base64,PHA+",
  );
});
