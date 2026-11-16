import { describe, expect, it, mock } from "bun:test";
import type { SourcePage } from "@/features/extensions";
import type { DownloadStore } from "./download-store";
import { NotDownloadedError } from "./download-store/utils/errors";
import { chapterHash, downloadKey, stageId } from "./paths";

mock.module("@/state/observable-persist", () => ({
  ObservablePersist: class {
    getTable() {
      return {};
    }
    set() {}
    deleteTable() {}
    getMetadata() {
      return {};
    }
    setMetadata() {}
    deleteMetadata() {}
  },
}));

const { chapterPages, openDownload } = await import("./open-download");

const url = "https://example.com/c/1";
const hash = chapterHash(url);
const path = `downloads/Manga [21]/Source A [1234]/Chapter 1 [${hash}].cbz`;
const key = downloadKey(21, "1234", hash);
const local: SourcePage[] = [
  { index: 0, imageUrl: "file:///p/001.jpg", headers: {}, local: true },
];
const remote: SourcePage[] = [
  { index: 0, imageUrl: "https://example.com/p/0", headers: {} },
];

const store = (
  entries: string[],
  get: DownloadStore["get"] = async (p) => `file:///${p}`,
) =>
  ({
    list: mock(async () =>
      entries.map((p) => ({ hash, paths: [p], local: true })),
    ),
    get: mock(get),
  }) as unknown as DownloadStore;

function setup(stores: DownloadStore[], unpackFails?: Error) {
  const runtime = {
    unpack: mock(async (_uri: string, _key: string) => {
      if (unpackFails) throw unpackFails;
      return local;
    }),
  };
  const pages = mock(async (_s: string, _u: string, _m?: string) => remote);
  return { runtime, pages, deps: { runtime, pages, stores: () => stores } };
}

describe("openDownload", () => {
  it("is undefined when no store has it", async () => {
    const { deps } = setup([store([]), store([])]);
    expect(await openDownload(21, "1234", url, deps)).toBeUndefined();
  });

  it("unpacks the downloaded file under its staging id", async () => {
    const { deps, runtime } = setup([store([path])]);
    expect(await openDownload(21, "1234", url, deps)).toEqual(local);
    expect(runtime.unpack).toHaveBeenCalledWith(
      `file:///${path}`,
      stageId(key),
    );
  });

  it("tries the next store when one only has a cloud placeholder", async () => {
    const cloud = store([path], async () => {
      throw new NotDownloadedError(path);
    });
    const { deps } = setup([cloud, store([path])]);
    expect(await openDownload(21, "1234", url, deps)).toEqual(local);
  });

  it("falls back to the device store", async () => {
    const device = store([path]);
    const { deps } = setup([store([]), device]);
    expect(await openDownload(21, "1234", url, deps)).toEqual(local);
    expect(device.get).toHaveBeenCalledWith(path);
  });
});

describe("chapterPages", () => {
  it("reads the source when it isn't downloaded", async () => {
    const { deps, pages } = setup([store([])]);
    expect(await chapterPages(21, "1234", url, undefined, deps)).toEqual(
      remote,
    );
    expect(pages).toHaveBeenCalledWith("1234", url, undefined);
  });

  it("opens the download without asking the source", async () => {
    const { deps, pages } = setup([store([path])]);
    expect(await chapterPages(21, "1234", url, undefined, deps)).toEqual(local);
    expect(pages).not.toHaveBeenCalled();
  });

  const cloud = () =>
    store([path], async () => {
      throw new NotDownloadedError(path);
    });

  it("reads the source for a cloud chapter when online", async () => {
    const { deps } = setup([cloud()]);
    expect(await chapterPages(21, "1234", url, undefined, deps)).toEqual(
      remote,
    );
  });

  it("says so when the cloud chapter and the source both fail", async () => {
    const { deps, pages } = setup([cloud()]);
    pages.mockImplementation(async () => {
      throw new Error("offline");
    });
    await expect(
      chapterPages(21, "1234", url, undefined, deps),
    ).rejects.toThrow(
      "This chapter is still in the cloud. Connect to download it.",
    );
  });

  it("falls back to the source for a broken file", async () => {
    const { deps, pages } = setup([store([path])], new Error("bad zip"));
    expect(await chapterPages(21, "1234", url, "m", deps)).toEqual(remote);
    expect(pages).toHaveBeenCalledWith("1234", url, "m");
  });
});
