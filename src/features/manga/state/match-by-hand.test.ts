import { beforeEach, describe, expect, it, mock } from "bun:test";
import { memoryStorage } from "../utils/chapter-storage/chapter-storage.mock";

const search = mock(
  async (_sourceId: string, _query: string, _page: number) => ({
    mangas: [],
    hasNextPage: false,
  }),
);

mock.module("@/features/extensions", () => ({
  runtime: { search, chapters: async () => ({ chapters: [] }) },
}));
mock.module("@/components/ui/toast", () => ({ toast: { destructive() {} } }));
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

const { exclusions$, pins$ } = await import("./exclusions");
const { readManual } = await import("./manual-matches");
const { matching$, selectSource, source$ } = await import("./source");
const { removeMatchByHand, setMatchByHand } = await import("./match-by-hand");

const A = { id: "a", name: "Alpha" };
const page = { url: "/m", title: "Mine", thumbnailUrl: null };
const titles = { search: ["T"], all: ["T"] };

beforeEach(() => search.mockClear());

describe("setMatchByHand", () => {
  it("includes an excluded source and stores the page", () => {
    exclusions$["3001"].set({ a: { reason: "not-matched", updatedAt: 1 } });
    setMatchByHand(3001, A, page);
    expect(readManual(3001, "a")).toEqual(page);
    expect(exclusions$["3001"].a.deletedAt.peek()).toBeNumber();
    expect(pins$["3001"].a.peek()).toBeDefined();
    expect(pins$["3001"].a.deletedAt.peek()).toBeUndefined();
  });

  it("sets the chosen source's match", () => {
    source$[3002].set({ sourceId: "a", manga: null });
    setMatchByHand(3002, A, page);
    expect(source$[3002].get()).toEqual({
      sourceId: "a",
      manga: { url: "/m", title: "Mine" },
    });
  });

  it("wins over the chosen source's search still running", async () => {
    let answer: (page: { mangas: never[]; hasNextPage: boolean }) => void =
      () => {};
    search.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          answer = resolve;
        }),
    );
    const running = selectSource(3007, A, titles);
    await new Promise((resolve) => setTimeout(resolve, 5));
    setMatchByHand(3007, A, page);
    answer({ mangas: [], hasNextPage: false });
    await running;
    expect(source$[3007].get()).toEqual({
      sourceId: "a",
      manga: { url: "/m", title: "Mine" },
    });
    expect(matching$[3007].get()).toBe(false);
  });

  it("leaves another chosen source alone", () => {
    source$[3003].set({ sourceId: "b", manga: null });
    setMatchByHand(3003, A, page);
    expect(source$[3003].get()).toEqual({ sourceId: "b", manga: null });
  });
});

describe("removeMatchByHand", () => {
  it("searches the chosen source again and keeps the pin", async () => {
    setMatchByHand(3004, A, page);
    source$[3004].set({ sourceId: "a", manga: { url: "/m", title: "Mine" } });
    await removeMatchByHand(3004, A, titles);
    expect(readManual(3004, "a")).toBeUndefined();
    expect(search).toHaveBeenCalledTimes(1);
    expect(source$[3004].get()).toEqual({ sourceId: "a", manga: null });
    expect(pins$["3004"].a.deletedAt.peek()).toBeUndefined();
  });

  it("drops the chapters stored under the manual page", async () => {
    memoryStorage.entries["3006/a"] = {
      manga: { url: "/m", title: "Mine" },
      chapters: [],
    };
    setMatchByHand(3006, A, page);
    source$[3006].set({ sourceId: "a", manga: { url: "/m", title: "Mine" } });
    await removeMatchByHand(3006, A, titles);
    expect(search).toHaveBeenCalledTimes(1);
    expect(memoryStorage.entries["3006/a"]).toBeUndefined();
  });

  it("does not search a source that isn't chosen", async () => {
    setMatchByHand(3005, A, page);
    await removeMatchByHand(3005, A, titles);
    expect(readManual(3005, "a")).toBeUndefined();
    expect(search).not.toHaveBeenCalled();
  });
});
