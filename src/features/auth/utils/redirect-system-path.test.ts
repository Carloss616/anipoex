import { expect, test } from "bun:test";
import { redirectSystemPath } from "./redirect-system-path";

test("sends the bare auth callback home", () => {
  expect(redirectSystemPath({ path: "anipoex://auth" })).toBe("/");
});

test("sends the auth callback home with the token fragment attached", () => {
  expect(
    redirectSystemPath({
      path: "anipoex://auth#access_token=abc123&token_type=Bearer",
    }),
  ).toBe("/");
});

test("sends the auth callback home when already normalized to a path", () => {
  expect(redirectSystemPath({ path: "/auth" })).toBe("/");
  expect(redirectSystemPath({ path: "/auth#access_token=abc123" })).toBe("/");
});

test("sends the auth callback home when AniList returns an error", () => {
  expect(
    redirectSystemPath({ path: "anipoex://auth#error=access_denied" }),
  ).toBe("/");
});

test("passes other deep links through untouched", () => {
  expect(redirectSystemPath({ path: "anipoex://manga/123" })).toBe(
    "anipoex://manga/123",
  );
  expect(redirectSystemPath({ path: "/manga/123" })).toBe("/manga/123");
});

test("does not swallow routes that merely start with auth", () => {
  expect(redirectSystemPath({ path: "anipoex://authors" })).toBe(
    "anipoex://authors",
  );
});

test("passes the root path through untouched", () => {
  expect(redirectSystemPath({ path: "anipoex://" })).toBe("anipoex://");
});
