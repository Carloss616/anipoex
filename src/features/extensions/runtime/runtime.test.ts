import { describe, expect, it } from "bun:test";
import { isRuntimeAvailable, runtime } from "./runtime";

describe("runtime fallback", () => {
  it("is unavailable and lists nothing", async () => {
    expect(isRuntimeAvailable).toBe(false);
    expect(await runtime.installed()).toEqual([]);
  });

  it("has no manga page to open", async () => {
    expect(await runtime.mangaWebUrl("1", "/manga/1")).toBeNull();
  });

  it("refuses pages with the unavailable message", async () => {
    await expect(runtime.pages("1", "/c")).rejects.toThrow(
      "Extensions run in the Android, iOS and desktop apps.",
    );
  });

  it("refuses to install with the unavailable message", async () => {
    await expect(runtime.install("https://x/a.apk", "key")).rejects.toThrow(
      "Extensions run in the Android, iOS and desktop apps.",
    );
  });
});
