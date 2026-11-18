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
    await runtime.challengedHosts();
    expect(calls).toEqual([
      ["installed", {}],
      ["install", { apkUrl: "https://example.com/a.apk", signingKey: "k" }],
      ["uninstall", { pkg: "pkg" }],
      ["search", { sourceId: "1", query: "q", page: 2 }],
      ["chapters", { sourceId: "1", mangaUrl: "/m", title: "T" }],
      ["mangaWebUrl", { sourceId: "1", mangaUrl: "/m" }],
      ["pages", { sourceId: "1", chapterUrl: "/c", memo: '{"slug":"s"}' }],
      ["setDns", { dns: "quad9" }],
      ["challengedHosts", {}],
    ]);
  });

  it("stagePage sends the page's url and index", async () => {
    const { calls, runtime } = recorder({ result: null });
    await runtime.stagePage(
      "source-1",
      { index: 0, imageUrl: "https://example.com/1.jpg", headers: {} },
      "21-1-a1b2c3d4",
      "001",
    );
    expect(calls).toEqual([
      [
        "stagePage",
        {
          sourceId: "source-1",
          imageUrl: "https://example.com/1.jpg",
          index: 0,
          stage: "21-1-a1b2c3d4",
          name: "001",
        },
      ],
    ]);
  });

  it("pack resolves to the uri", async () => {
    const { runtime } = recorder({ result: { uri: "file:///c/packed/s.cbz" } });
    expect(await runtime.pack("s", "<ComicInfo/>")).toBe(
      "file:///c/packed/s.cbz",
    );
  });

  it("unpack returns local pages", async () => {
    const { runtime } = recorder({
      result: [{ index: 0, uri: "file:///u/001.jpg" }],
    });
    expect(await runtime.unpack("file:///c/s.cbz", "k")).toEqual([
      { index: 0, imageUrl: "file:///u/001.jpg", headers: {}, local: true },
    ]);
  });

  it("unpacked returns local pages, or null when not unpacked", async () => {
    const page = { index: 0, uri: "file:///u/001.jpg" };
    expect(await recorder({ result: [page] }).runtime.unpacked("k")).toEqual([
      { index: 0, imageUrl: "file:///u/001.jpg", headers: {}, local: true },
    ]);
    expect(await recorder({ result: null }).runtime.unpacked("k")).toBeNull();
  });

  it("errorRejects", async () => {
    const { runtime } = recorder({ error: "nope" });
    await expect(runtime.search("1", "q", 1)).rejects.toThrow("nope");
  });
});
