import { describe, expect, it, mock } from "bun:test";
import { isRuntimeAvailable, runtime } from "./runtime";

// `desktop` is read once at import, so each case swaps it and re-evaluates `runtime` with a cache-busting query.
const load = (desktop?: unknown) => {
  mock.module("@/utils/desktop", () => ({ desktop }));
  return import(`./runtime?${Math.random()}`);
};

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

describe("runtime on desktop", () => {
  it("usesBridge", async () => {
    const { isRuntimeAvailable } = await load({
      runtime: async () => ({ result: [] }),
    });
    expect(isRuntimeAvailable).toBe(true);
  });

  it("pageImageIsMainsUrl", async () => {
    const { runtime } = await load({ runtime: async () => ({ result: null }) });
    const page = { index: 0, imageUrl: "anipoex-page://p/1", headers: {} };
    expect(await runtime.pageImage("1", page)).toBe("anipoex-page://p/1");
  });
});
