import { afterEach, describe, expect, it, mock } from "bun:test";

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

const {
  cancel,
  downloadProgress$,
  downloadQueue$,
  downloadStops,
  downloaded$,
  enqueue,
  moveUp,
  queuedOf,
  retry,
} = await import("./download-queue");
const { chapterHash, downloadKey } = await import("../utils/paths");

const item = (url: string, sourceId = "1234") => ({
  manga: { id: 21, title: "Manga" },
  source: { id: sourceId, name: "Source A" },
  chapter: { url, name: url, number: 1, scanlator: null, memo: null },
});
const keyOf = (url: string, sourceId = "1234") =>
  downloadKey(21, sourceId, chapterHash(url));
const urls = (sourceId: string) => queuedOf(sourceId).map((e) => e.chapter.url);

afterEach(() => {
  downloadQueue$.set({});
  downloadProgress$.set({});
  downloaded$.set({});
  downloadStops.clear();
});

describe("enqueue", () => {
  it("orders items and queues them", () => {
    expect(enqueue([item("a"), item("b")])).toBe(2);
    expect(downloadQueue$.get()[keyOf("a")]).toMatchObject({
      order: 0,
      state: "queued",
    });
    expect(downloadQueue$.get()[keyOf("b")].order).toBe(1);
    expect(enqueue([item("c")])).toBe(1);
    expect(downloadQueue$.get()[keyOf("c")].order).toBe(2);
  });

  it("skips a chapter already queued", () => {
    expect(enqueue([item("a")])).toBe(1);
    expect(enqueue([item("a")])).toBe(0);
    expect(Object.keys(downloadQueue$.get())).toHaveLength(1);
  });

  it("skips a chapter already downloaded", () => {
    downloaded$["21/1234"].set({ [chapterHash("a")]: "local" });
    expect(enqueue([item("a")])).toBe(0);
    expect(Object.keys(downloadQueue$.get())).toHaveLength(0);
  });
});

describe("cancel", () => {
  it("removes the entry and calls its stop once", () => {
    enqueue([item("a")]);
    const key = keyOf("a");
    downloadProgress$[key].set(0.5);
    const stop = mock(() => {});
    downloadStops.set(key, stop);
    cancel(key);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(downloadStops.has(key)).toBe(false);
    expect(downloadQueue$.get()[key]).toBeUndefined();
    expect(downloadProgress$.get()[key]).toBeUndefined();
  });
});

describe("moveUp", () => {
  it("swaps with the entry before it", () => {
    enqueue([item("a"), item("b"), item("c")]);
    moveUp(keyOf("c"));
    expect(urls("1234")).toEqual(["a", "c", "b"]);
  });

  it("does nothing for the first entry", () => {
    enqueue([item("a"), item("b")]);
    moveUp(keyOf("a"));
    expect(urls("1234")).toEqual(["a", "b"]);
  });
});

describe("retry", () => {
  it("requeues a failed entry keeping its order", () => {
    enqueue([item("a"), item("b")]);
    const key = keyOf("b");
    downloadQueue$[key].assign({ state: "failed", error: "boom" });
    retry(key);
    const entry = downloadQueue$.get()[key];
    expect(entry.state).toBe("queued");
    expect(entry.error).toBeUndefined();
    expect(entry.order).toBe(1);
  });
});

describe("queuedOf", () => {
  it("lists only queued entries of that source", () => {
    enqueue([item("a"), item("b"), item("c", "other")]);
    downloadQueue$[keyOf("a")].state.set("running");
    expect(urls("1234")).toEqual(["b"]);
  });
});
