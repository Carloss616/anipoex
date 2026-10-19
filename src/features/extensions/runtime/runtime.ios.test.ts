import { describe, expect, it, mock } from "bun:test";

const calls: [string, string][] = [];
let reply = '{"result":null}';

mock.module("expo", () => ({
  requireNativeModule: () => ({
    call: async (method: string, argsJson: string) => {
      calls.push([method, argsJson]);
      return reply;
    },
  }),
}));

const { isRuntimeAvailable, runtime } = await import("./runtime.ios");

describe("runtime.ios", () => {
  it("sendsJson", async () => {
    calls.length = 0;
    await runtime.install("https://example.com/a.apk", "k");
    expect(calls).toEqual([
      ["install", '{"apkUrl":"https://example.com/a.apk","signingKey":"k"}'],
    ]);
  });

  it("resolvesResult", async () => {
    reply = '{"result":[]}';
    expect(await runtime.installed()).toEqual([]);
  });

  it("rejectsError", async () => {
    reply = '{"error":"nope"}';
    await expect(runtime.search("1", "q", 1)).rejects.toThrow(
      new Error("nope"),
    );
  });

  it("available", () => {
    expect(isRuntimeAvailable).toBe(true);
  });
});
