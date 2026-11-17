import { describe, expect, it, mock } from "bun:test";
import type { SourcePage } from "@/features/extensions";
import type { QueuedDownload } from "../state/download-queue";
import { comicInfo } from "./comic-info";
import { type DownloadDeps, downloadChapter, PAUSE } from "./download-chapter";
import type { DownloadStore } from "./download-store";
import { chapterPath, stageId } from "./paths";

const item: QueuedDownload = {
  key: "21/1234/abcd0123",
  order: 0,
  state: "running",
  manga: { id: 21, title: "Manga" },
  source: { id: "1234", name: "Source A" },
  chapter: {
    url: "https://example.com/c/1",
    name: "Chapter 1",
    number: 1,
    scanlator: null,
    memo: '{"id":1}',
  },
};
const stage = stageId(item.key);
const page = (index: number, list = 0): SourcePage => ({
  index,
  imageUrl: `https://example.com/p/${list}/${index}`,
  headers: {},
});

function setup(fails: number[] = []) {
  const calls: string[] = [];
  let lists = 0;
  const pages = mock(async () => {
    const list = lists++;
    return [page(0, list), page(1, list)];
  });
  const stagePage = mock(
    async (_id: string, p: SourcePage, _stage: string, name: string) => {
      calls.push(`stage ${name}`);
      if (fails.includes(p.index)) {
        fails.splice(fails.indexOf(p.index), 1);
        throw new Error("page failed");
      }
    },
  );
  const pack = mock(async () => {
    calls.push("pack");
    return "file:///tmp/packed.cbz";
  });
  const dropStage = mock(async () => {
    calls.push("drop");
  });
  const put = mock(async (_path: string, _uri: string) => {
    calls.push("put");
  });
  const store = { put } as unknown as DownloadStore;
  const progress: number[] = [];
  const controller = new AbortController();
  const deps: DownloadDeps = {
    runtime: { pages, stagePage, pack, dropStage },
    store: () => store,
    onProgress: (done, count) => progress.push(done / count),
    signal: controller.signal,
  };
  return {
    calls,
    pages,
    stagePage,
    pack,
    dropStage,
    put,
    progress,
    controller,
    deps,
  };
}

describe("downloadChapter", () => {
  it("stages each page, packs, puts and drops the stage", async () => {
    const s = setup();
    await downloadChapter(item, s.deps);
    expect(s.pages).toHaveBeenCalledWith("1234", item.chapter.url, '{"id":1}');
    expect(s.stagePage.mock.calls.map((c) => [c[2], c[3]])).toEqual([
      [stage, "001"],
      [stage, "002"],
    ]);
    expect(s.pack).toHaveBeenCalledWith(stage, comicInfo(item));
    expect(s.put).toHaveBeenCalledWith(
      chapterPath(item.manga, item.source, item.chapter),
      "file:///tmp/packed.cbz",
    );
    expect(s.dropStage).toHaveBeenCalledWith(stage);
    expect(s.calls.at(-1)).toBe("drop");
    expect(s.progress).toEqual([0.5, 1]);
  });

  it("reloads the page list once and resumes at the failed page", async () => {
    const s = setup([1]);
    await downloadChapter(item, s.deps);
    expect(s.pages).toHaveBeenCalledTimes(2);
    expect(s.stagePage.mock.calls.map((c) => c[1].imageUrl)).toEqual([
      "https://example.com/p/0/0",
      "https://example.com/p/0/1",
      "https://example.com/p/1/1",
    ]);
    expect(s.put).toHaveBeenCalledTimes(1);
  });

  it("rejects on a second failure and still drops the stage", async () => {
    const s = setup([1, 1]);
    await expect(downloadChapter(item, s.deps)).rejects.toThrow(
      "Page 2 of 2: page failed",
    );
    expect(s.dropStage).toHaveBeenCalledWith(stage);
    expect(s.put).not.toHaveBeenCalled();
  });

  it("stops when aborted", async () => {
    const s = setup();
    s.stagePage.mockImplementationOnce(async () => s.controller.abort());
    const error = await downloadChapter(item, s.deps).catch((e) => e);
    expect(error.name).toBe("AbortError");
    expect(s.stagePage).toHaveBeenCalledTimes(1);
    expect(s.dropStage).toHaveBeenCalledWith(stage);
    expect(s.put).not.toHaveBeenCalled();
  });

  it("keeps the stage on a pause and resumes after its pages", async () => {
    const s = setup();
    s.stagePage.mockImplementationOnce(async () => s.controller.abort(PAUSE));
    await downloadChapter(item, s.deps).catch(() => {});
    expect(s.dropStage).not.toHaveBeenCalled();

    const next = setup();
    await downloadChapter(item, { ...next.deps, from: { done: 1, count: 2 } });
    expect(next.stagePage.mock.calls.map((c) => c[3])).toEqual(["002"]);
    expect(next.dropStage).toHaveBeenCalledTimes(1);
  });

  it("starts over when the chapter has another page count", async () => {
    const s = setup();
    await downloadChapter(item, { ...s.deps, from: { done: 1, count: 3 } });
    expect(s.stagePage.mock.calls.map((c) => c[3])).toEqual(["001", "002"]);
    // Once for the old stage, once when done.
    expect(s.dropStage).toHaveBeenCalledTimes(2);
  });

  it("doesn't put a chapter aborted while packing", async () => {
    const s = setup();
    s.pack.mockImplementationOnce(async () => {
      s.controller.abort();
      return "file:///tmp/packed.cbz";
    });
    const error = await downloadChapter(item, s.deps).catch((e) => e);
    expect(error.name).toBe("AbortError");
    expect(s.put).not.toHaveBeenCalled();
    expect(s.dropStage).toHaveBeenCalledWith(stage);
  });

  it("keeps the first list's page name width after a reload", async () => {
    const s = setup([1]);
    s.pages.mockImplementationOnce(async () =>
      Array.from({ length: 999 }, (_, i) => page(i)),
    );
    s.pages.mockImplementationOnce(async () =>
      Array.from({ length: 1000 }, (_, i) => page(i, 1)),
    );
    await downloadChapter(item, s.deps);
    expect(s.stagePage.mock.calls.slice(0, 4).map((c) => c[3])).toEqual([
      "001",
      "002",
      "002",
      "003",
    ]);
  });

  it("puts into the root current at put time", async () => {
    const s = setup();
    const a = { put: mock(async () => {}) } as unknown as DownloadStore;
    const b = { put: mock(async () => {}) } as unknown as DownloadStore;
    let current = a;
    s.pack.mockImplementationOnce(async () => {
      current = b;
      return "file:///tmp/packed.cbz";
    });
    await downloadChapter(item, { ...s.deps, store: () => current });
    expect(a.put).not.toHaveBeenCalled();
    expect(b.put).toHaveBeenCalledTimes(1);
  });

  it("rejects without a store before fetching", async () => {
    const s = setup();
    await expect(
      downloadChapter(item, { ...s.deps, store: () => undefined }),
    ).rejects.toThrow("Downloads need the app");
    expect(s.pages).not.toHaveBeenCalled();
  });

  it("rejects a chapter with no pages", async () => {
    const s = setup();
    s.pages.mockImplementationOnce(async () => []);
    await expect(downloadChapter(item, s.deps)).rejects.toThrow("No pages");
    expect(s.dropStage).toHaveBeenCalledWith(stage);
  });
});
