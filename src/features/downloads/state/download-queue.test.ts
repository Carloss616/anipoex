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
  retryFailed,
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

  it("skips the same chapter twice in one call", () => {
    expect(enqueue([item("a"), item("a")])).toBe(1);
  });

  it("skips a chapter already downloaded", () => {
    downloaded$["21/1234"].set({
      [chapterHash("a")]: "local",
      [chapterHash("b")]: "cloud",
    });
    expect(enqueue([item("a"), item("b")])).toBe(0);
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

  it("skips a running or failed entry", () => {
    enqueue([item("a"), item("b"), item("c")]);
    downloadQueue$[keyOf("b")].state.set("failed");
    moveUp(keyOf("c"));
    expect(urls("1234")).toEqual(["c", "a"]);
  });

  it("does nothing when no queued entry is before it", () => {
    enqueue([item("a"), item("b")]);
    downloadQueue$[keyOf("a")].state.set("running");
    moveUp(keyOf("b"));
    expect(downloadQueue$.get()[keyOf("b")].order).toBe(1);
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

describe("retryFailed", () => {
  it("requeues every failed entry and leaves the rest", () => {
    enqueue([item("a"), item("b"), item("c")]);
    downloadQueue$[keyOf("a")].assign({ state: "failed", error: "boom" });
    downloadQueue$[keyOf("b")].state.set("running");
    downloadQueue$[keyOf("c")].assign({ state: "failed", error: "boom" });
    retryFailed();
    const queue = downloadQueue$.get();
    expect(queue[keyOf("a")].state).toBe("queued");
    expect(queue[keyOf("a")].error).toBeUndefined();
    expect(queue[keyOf("b")].state).toBe("running");
    expect(queue[keyOf("c")].state).toBe("queued");
  });
});

describe("queuedOf", () => {
  it("lists only queued entries of that source", () => {
    enqueue([item("a"), item("b"), item("c", "other")]);
    downloadQueue$[keyOf("a")].state.set("running");
    expect(urls("1234")).toEqual(["b"]);
  });
});
