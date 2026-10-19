import { beforeEach, describe, expect, it, mock } from "bun:test";

const pending: Record<string, (mangas: unknown[]) => void> = {};
const search = mock(
  (sourceId: string, query: string, _page: number) =>
    new Promise<{ mangas: unknown[]; hasNextPage: boolean }>(
      (resolve, reject) => {
        if (query === "boom") return reject(new Error("down"));
        pending[`${sourceId}:${query}`] = (mangas) =>
          resolve({ mangas, hasNextPage: false });
      },
    ),
);
const destructive = mock((_label: string) => {});

mock.module("@/features/extensions", () => ({ runtime: { search } }));
mock.module("@/components/ui/toast", () => ({ toast: { destructive } }));
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

const { matching$, resumeSource, selectSource, source$ } = await import("./source");

const A = { id: "a", name: "Alpha" };
const B = { id: "b", name: "Beta" };
const hit = { url: "/1", title: "One Piece", thumbnailUrl: null };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  search.mockClear();
  destructive.mockClear();
  source$.set({});
});

describe("selectSource", () => {
  it("stores the exact match and skips the repeated english query", async () => {
    const done = selectSource(1, A, {
      search: ["One Piece", "One Piece"],
      all: ["One Piece"],
    });
    await flush();
    expect(matching$[1].get()).toBe(true);
    pending["a:One Piece"]([hit]);
    await done;
    expect(search).toHaveBeenCalledTimes(1);
    expect(source$[1].get()).toEqual({
      sourceId: "a",
      manga: { url: "/1", title: "One Piece" },
    });
    expect(matching$[1].get()).toBe(false);
  });

  it("stores the pick before the search resolves", async () => {
    const done = selectSource(5, A, { search: ["p"], all: ["p"] });
    expect(source$[5].get()).toEqual({ sourceId: "a" });
    await flush();
    pending["a:p"]([]);
    await done;
    expect(source$[5].get()).toEqual({ sourceId: "a", manga: null });
  });

  it("stores null when nothing matches", async () => {
    const done = selectSource(2, A, { search: ["x", null], all: ["x"] });
    await flush();
    pending["a:x"]([{ ...hit, title: "x party" }]);
    await done;
    expect(source$[2].get()).toEqual({ sourceId: "a", manga: null });
  });

  it("lets the last pick win", async () => {
    const first = selectSource(3, A, { search: ["t"], all: ["t"] });
    const second = selectSource(3, B, { search: ["t"], all: ["t"] });
    await flush();
    pending["b:t"]([{ ...hit, title: "t" }]);
    await second;
    pending["a:t"]([]);
    await first;
    expect(source$[3].get()).toEqual({
      sourceId: "b",
      manga: { url: "/1", title: "t" },
    });
  });

  it("toasts and keeps the pick without a manga when the search fails", async () => {
    source$[4].set({ sourceId: "b", manga: null });
    await selectSource(4, A, { search: ["boom"], all: ["boom"] });
    expect(destructive).toHaveBeenCalledWith("Couldn't search Alpha");
    expect(source$[4].get()).toEqual({ sourceId: "a" });
    expect(matching$[4].get()).toBe(false);
  });
});

describe("resumeSource", () => {
  const titles = { search: ["r"], all: ["r"] };

  it("searches a pick that has no manga yet", async () => {
    source$[6].set({ sourceId: "a" });
    const done = resumeSource(6, A, titles);
    await flush();
    pending["a:r"]([{ ...hit, title: "r" }]);
    await done;
    expect(source$[6].get()).toEqual({
      sourceId: "a",
      manga: { url: "/1", title: "r" },
    });
  });

  it("leaves a finished match, another source's pick and a running search alone", async () => {
    search.mockClear();
    source$[7].set({ sourceId: "a", manga: null });
    source$[8].set({ sourceId: "b" });
    source$[9].set({ sourceId: "a" });
    matching$[9].set(true);
    await resumeSource(7, A, titles);
    await resumeSource(8, A, titles);
    await resumeSource(9, A, titles);
    expect(search).not.toHaveBeenCalled();
    matching$[9].set(false);
  });
});
