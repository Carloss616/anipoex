import { describe, expect, test } from "bun:test";
import { type GitHubRelease, isNewer, updateFrom } from "./release";

const release = (overrides: Partial<GitHubRelease> = {}): GitHubRelease => ({
  tag_name: "v0.2.0",
  body: "### Features",
  html_url: "https://example.com/releases/v0.2.0",
  draft: false,
  prerelease: false,
  assets: [
    {
      name: "anipoex-v0.2.0.apk",
      browser_download_url: "https://example.com/anipoex-v0.2.0.apk",
      size: 42,
    },
  ],
  ...overrides,
});

describe("isNewer", () => {
  test("compares each part as a number", () => {
    expect(isNewer("v0.10.0", "0.9.9")).toBe(true);
    expect(isNewer("v1.0.0", "0.99.99")).toBe(true);
    expect(isNewer("v0.1.1", "0.1.0")).toBe(true);
  });

  test("an equal or older version isn't newer", () => {
    expect(isNewer("v0.1.0", "0.1.0")).toBe(false);
    expect(isNewer("v0.1.0", "0.2.0")).toBe(false);
  });

  test("a version that isn't X.Y.Z never is", () => {
    expect(isNewer("nightly", "0.1.0")).toBe(false);
    expect(isNewer("v0.2.0", "dev")).toBe(false);
  });
});

describe("updateFrom", () => {
  test("offers a newer release with its APK", () => {
    expect(updateFrom(release(), "0.1.0")).toEqual({
      version: "0.2.0",
      notes: "### Features",
      url: "https://example.com/releases/v0.2.0",
      apkUrl: "https://example.com/anipoex-v0.2.0.apk",
      apkSize: 42,
    });
  });

  test("skips a release that isn't newer", () => {
    expect(updateFrom(release(), "0.2.0")).toBeUndefined();
  });

  test("waits until the APK is uploaded", () => {
    expect(updateFrom(release({ assets: [] }), "0.1.0")).toBeUndefined();
  });

  test("skips prereleases and drafts", () => {
    expect(updateFrom(release({ prerelease: true }), "0.1.0")).toBeUndefined();
    expect(updateFrom(release({ draft: true }), "0.1.0")).toBeUndefined();
  });

  test("reads missing notes as empty", () => {
    expect(updateFrom(release({ body: null }), "0.1.0")?.notes).toBe("");
  });
});
