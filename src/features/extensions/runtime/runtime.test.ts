import { describe, expect, it } from "bun:test";
import { isRuntimeAvailable, runtime } from "./runtime";

describe("runtime fallback", () => {
  it("is unavailable and lists nothing", async () => {
    expect(isRuntimeAvailable).toBe(false);
    expect(await runtime.installed()).toEqual([]);
  });

  it("refuses to install with the Android-only message", async () => {
    await expect(runtime.install("https://x/a.apk", "key")).rejects.toThrow(
      "Extensions run on Android only for now.",
    );
  });
});
