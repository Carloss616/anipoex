import { describe, expect, it, mock } from "bun:test";

// `desktop` is read once at import, so each case swaps it and re-evaluates `runtime.web` with a cache-busting query.
const load = (desktop?: unknown) => {
  mock.module("@/utils/desktop", () => ({ desktop }));
  return import(`./runtime.web?${Math.random()}`);
};

describe("runtime.web", () => {
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

  it("noBridge", async () => {
    const { isRuntimeAvailable, runtime } = await load();
    expect(isRuntimeAvailable).toBe(false);
    await expect(
      runtime.install("https://example.com/a.apk", "k"),
    ).rejects.toThrow("Extensions run in the Android, iOS and desktop apps.");
  });
});
