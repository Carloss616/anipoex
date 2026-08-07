import { expect, test } from "bun:test";
import { parseFragment } from "./parse-fragment";

test("reads access_token out of the fragment", () => {
  const url = "anipoex://auth#access_token=abc123&token_type=Bearer";
  expect(parseFragment(url).access_token).toBe("abc123");
});

test("keeps the other fragment params", () => {
  const url =
    "anipoex://auth#access_token=abc123&token_type=Bearer&expires_in=31536000";
  expect(parseFragment(url)).toEqual({
    access_token: "abc123",
    token_type: "Bearer",
    expires_in: "31536000",
  });
});

test("returns empty when there is no fragment", () => {
  expect(parseFragment("anipoex://auth")).toEqual({});
});

test("returns empty when the fragment is blank", () => {
  expect(parseFragment("anipoex://auth#")).toEqual({});
});

test("has no access_token when AniList returns an error instead", () => {
  const url = "anipoex://auth#error=access_denied";
  expect(parseFragment(url).access_token).toBeUndefined();
});

test("decodes percent-encoded values", () => {
  const url = "anipoex://auth#access_token=a%2Bb%3Dc";
  expect(parseFragment(url).access_token).toBe("a+b=c");
});
