import { describe, expect, it } from "bun:test";
import { bridgeRuntime } from "./bridge-runtime";

const recorder = (reply: { result?: unknown; error?: string }) => {
  const calls: [string, Record<string, unknown>][] = [];
  const send = async (method: string, args: Record<string, unknown>) => {
    calls.push([method, args]);
    return reply;
  };
  return { calls, runtime: bridgeRuntime(send) };
};

describe("bridgeRuntime", () => {
  it("sendsNamedArgs", async () => {
    const { calls, runtime } = recorder({ result: [] });
    expect(await runtime.installed()).toEqual([]);
    await runtime.install("https://example.com/a.apk", "k");
    await runtime.uninstall("pkg");
    await runtime.search("1", "q", 2);
    await runtime.chapters("1", "/m", "T");
    await runtime.mangaWebUrl("1", "/m");
    await runtime.pages("1", "/c", '{"slug":"s"}');
    await runtime.setDns("quad9");
    expect(calls).toEqual([
      ["installed", {}],
      ["install", { apkUrl: "https://example.com/a.apk", signingKey: "k" }],
      ["uninstall", { pkg: "pkg" }],
      ["search", { sourceId: "1", query: "q", page: 2 }],
      ["chapters", { sourceId: "1", mangaUrl: "/m", title: "T" }],
      ["mangaWebUrl", { sourceId: "1", mangaUrl: "/m" }],
      ["pages", { sourceId: "1", chapterUrl: "/c", memo: '{"slug":"s"}' }],
      ["setDns", { dns: "quad9" }],
    ]);
  });

  it("errorRejects", async () => {
    const { runtime } = recorder({ error: "nope" });
    await expect(runtime.search("1", "q", 1)).rejects.toThrow("nope");
  });
});
