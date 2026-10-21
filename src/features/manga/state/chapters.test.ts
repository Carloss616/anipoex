import { describe, expect, it, mock } from "bun:test";
import { memoryStorage } from "../utils/chapter-storage/chapter-storage.mock";

mock.module("../utils/chapter-storage", () => memoryStorage);
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

const { chapters$, readChapters } = await import("./chapters");
const { exclusions$ } = await import("./exclusions");

// Manga ids from 100 up: the chapters in memory are shared with the other state tests.
const page = { manga: { url: "/1", title: "One" }, chapters: [] };
memoryStorage.entries["101/a"] = page;
memoryStorage.entries["104/a"] = page;
memoryStorage.entries["105/a"] = page;
memoryStorage.failing.add("103/a");
const { writes } = memoryStorage;
const flush = () => new Promise((resolve) => setTimeout(resolve, 10));

describe("chapters$", () => {
  it("reads one manga's entry in one source once storage answers", async () => {
    expect(await readChapters(101, "a")).toEqual(page);
    expect(await readChapters(101, "b")).toBeUndefined();
  });

  it("reads nothing when storage fails", async () => {
    expect(await readChapters(103, "a")).toBeUndefined();
  });

  it("writes only the entry that changed", async () => {
    const value = { manga: { url: "/2", title: "Two" }, chapters: [] };
    await readChapters(102, "b");
    writes.length = 0;
    chapters$["102/b"].set(value);
    await flush();
    expect(writes).toEqual([["102/b", value]]);
    expect(await readChapters(102, "b")).toEqual(value);
  });

  it("writes an entry it never read", async () => {
    const value = { manga: { url: "/6", title: "Six" }, chapters: [] };
    writes.length = 0;
    chapters$["106/a"].set(value);
    await flush();
    expect(writes).toEqual([["106/a", value]]);
    expect(await readChapters(106, "a")).toEqual(value);
  });

  it("drops the entry of a source when it becomes excluded", async () => {
    await readChapters(104, "a");
    writes.length = 0;
    exclusions$["104"].set({ a: { reason: "other", updatedAt: 1 } });
    await flush();
    expect(writes).toEqual([["104/a", undefined]]);
    expect(await readChapters(104, "a")).toBeUndefined();

    // An exclusion already in place doesn't drop the list again.
    writes.length = 0;
    exclusions$["104"].set({
      a: { reason: "other", updatedAt: 1 },
      b: { reason: "other", updatedAt: 2, deletedAt: 2 },
    });
    await flush();
    expect(writes).toEqual([]);
  });

  it("drops an entry it never read", async () => {
    writes.length = 0;
    exclusions$["105"].set({ a: { reason: "other", updatedAt: 1 } });
    await flush();
    expect(writes).toEqual([["105/a", undefined]]);
  });
});
