import { beforeEach, describe, expect, it, mock } from "bun:test";
import { memoryStorage } from "../utils/chapter-storage/chapter-storage.mock";

const searchCalls: string[] = [];
const searchPending: Record<string, (titles: string[]) => void> = {};
const chaptersPending: Record<
  string,
  { resolve: (c: unknown) => void; reject: (e: Error) => void }
> = {};
const chaptersCalls: string[] = [];

const search = mock((sourceId: string, query: string, _page: number) => {
  searchCalls.push(sourceId);
  return new Promise<{ mangas: unknown[]; hasNextPage: boolean }>((resolve) => {
    searchPending[sourceId] = (titles) =>
      resolve({
        mangas: titles.map((title) => ({
          url: `/${sourceId}`,
          title,
          thumbnailUrl: null,
        })),
        hasNextPage: false,
      });
    void query;
  });
});
const chapters = mock((sourceId: string, url: string, _title: string) => {
  chaptersCalls.push(`${sourceId}${url}`);
  return new Promise<unknown>((resolve, reject) => {
    chaptersPending[sourceId] = { resolve, reject };
  });
});

mock.module("@/features/extensions", () => ({ runtime: { search, chapters } }));
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
const { source$ } = await import("./source");
const {
  probes$,
  scanning$,
  scanningAll$,
  scanSources,
  probeSource,
  isScanning,
} = await import("./probes");
const { fetchChapters } = await import("../utils/fetch-chapters");

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const sources = (...ids: string[]) =>
  ids.map((id) => ({ id, name: id.toUpperCase(), initials: "XX" }));
const titles = { search: ["T"], all: ["T"] };
const ch = (name: string, number: number) => ({
  url: `/c/${name}`,
  name,
  number,
  dateUpload: 0,
  scanlator: null,
  memo: null,
});
const scan = (over: Record<string, unknown> = {}) =>
  scanSources({
    mangaId: 201,
    sources: sources("a"),
    titles,
    read: () => 0,
    keep: undefined,
    ...over,
  } as Parameters<typeof scanSources>[0]);
/** Answers a source's search with a hit and its chapters with the given numbers. */
async function answer(id: string, numbers: number[]) {
  await flush();
  searchPending[id](["T"]);
  await flush();
  chaptersPending[id].resolve({
    chapters: numbers.map((n) => ch(`c${n}`, n)),
  });
}

beforeEach(() => {
  search.mockClear();
  chapters.mockClear();
  searchCalls.length = 0;
  chaptersCalls.length = 0;
  probes$.set({});
  scanning$.set({});
  scanningAll$.set({});
  exclusions$.set({});
  pins$.set({});
  source$.set({});
});

describe("probeSource", () => {
  it("a matched source becomes a probe with its latest chapter", async () => {
    const done = probeSource(201, { id: "a", name: "A" }, titles);
    await flush();
    searchPending.a(["T"]);
    await flush();
    chaptersPending.a.resolve({
      chapters: [ch("Ch.12", 12), ch("Chapter 13", -1)],
    });
    expect(await done).toMatchObject({
      matched: true,
      count: 2,
      latest: 13,
      errored: false,
    });
    await flush();
    // Stored, so picking the source later neither searches nor loads.
    expect(memoryStorage.entries["201/a"]).toEqual({
      manga: { url: "/a", title: "T" },
      chapters: [ch("Ch.12", 12), ch("Chapter 13", -1)],
    });
  });

  it("no equal title is a no-match probe", async () => {
    const done = probeSource(201, { id: "a", name: "A" }, titles);
    await flush();
    searchPending.a(["Other"]);
    expect(await done).toMatchObject({
      matched: false,
      count: 0,
      latest: 0,
      errored: false,
    });
    expect(chapters).not.toHaveBeenCalled();
  });

  it("a thrown chapters read is an error probe", async () => {
    const done = probeSource(201, { id: "a", name: "A" }, titles);
    await flush();
    searchPending.a(["T"]);
    await flush();
    chaptersPending.a.reject(new Error("down"));
    expect(await done).toMatchObject({ errored: true, matched: false });
  });

  it("a chapter read that never answers ends as an error probe", async () => {
    const done = probeSource(201, { id: "h", name: "H" }, titles, 20);
    await flush();
    // its own source id, so the hung read never meets another test's load
    searchPending.h(["T"]);
    expect(await done).toMatchObject({ errored: true, matched: false });
  });

  it("a probe shares the detail's chapter load", async () => {
    const detail = fetchChapters("a", "/a", "T");
    const done = probeSource(201, { id: "a", name: "A" }, titles);
    await flush();
    searchPending.a(["T"]);
    await flush();
    chaptersPending.a.resolve({ chapters: [ch("c5", 5)] });
    await detail;
    expect(await done).toMatchObject({ latest: 5, count: 1 });
    expect(chapters).toHaveBeenCalledTimes(1);
  });
});

describe("scanSources", () => {
  it("probes land one by one", async () => {
    const done = scan({ sources: sources("a", "b") });
    await answer("a", [3]);
    await flush();
    expect(probes$["201"].a.get()?.latest).toBe(3);
    expect(scanning$["201"].a.get()).toBeUndefined();
    expect(scanning$["201"].b.get()).toBe(true);
    searchPending.b([]);
    await done;
    expect(scanning$["201"].get()).toEqual({});
  });

  it("a second Scan all of the same manga is ignored", async () => {
    const first = scan({ sources: sources("a", "b") });
    await flush();
    const second = scan({ sources: sources("a", "b") });
    await flush();
    expect(search).toHaveBeenCalledTimes(2);
    searchPending.a([]);
    searchPending.b([]);
    await Promise.all([first, second]);
  });

  it("rescans of different sources run together", async () => {
    const first = scan({ sources: sources("a", "b"), only: ["a"] });
    await flush();
    const second = scan({ sources: sources("a", "b"), only: ["b"] });
    await flush();
    expect(search).toHaveBeenCalledTimes(2);
    expect(scanning$["201"].get()).toEqual({ a: true, b: true });
    searchPending.a([]);
    searchPending.b([]);
    await Promise.all([first, second]);
    expect(scanning$["201"].get()).toEqual({});
  });

  it("a rescan of a source already scanning is ignored", async () => {
    const first = scan({ sources: sources("a", "b"), only: ["a"] });
    await flush();
    const second = scan({ sources: sources("a", "b"), only: ["a"] });
    await flush();
    expect(search).toHaveBeenCalledTimes(1);
    searchPending.a([]);
    await Promise.all([first, second]);
  });

  it("isScanning holds while the scan runs, read at call time", async () => {
    expect(isScanning(201)).toBe(false);
    const done = scan({ sources: sources("a") });
    await flush();
    expect(isScanning(201)).toBe(true);
    expect(isScanning(2)).toBe(false);
    searchPending.a([]);
    await done;
    expect(isScanning(201)).toBe(false);
  });

  it("a scan all flags the manga until it ends", async () => {
    const done = scan({ sources: sources("a", "b") });
    await flush();
    expect(scanningAll$["201"].get()).toBe(true);
    searchPending.a([]);
    await flush();
    expect(scanningAll$["201"].get()).toBe(true);
    searchPending.b([]);
    await done;
    expect(scanningAll$["201"].get()).toBeUndefined();
  });

  it("a scan with only never flags a scan all", async () => {
    const done = scan({ sources: sources("a", "b"), only: ["a"] });
    await flush();
    expect(scanningAll$["201"].get()).toBeUndefined();
    searchPending.a([]);
    await done;
    expect(scanningAll$["201"].get()).toBeUndefined();
  });

  it("a recent probe is probed again", async () => {
    probes$["201"].a.set({
      provider: "a",
      providerName: "A",
      latest: 1,
      count: 1,
      matched: true,
      errored: false,
      updatedAt: Date.now() - 60_000,
    });
    const done = scan();
    await flush();
    expect(search).toHaveBeenCalledTimes(1);
    searchPending.a([]);
    await done;
  });

  it("auto-excludes after the scan, never the kept source", async () => {
    const done = scan({
      sources: sources("a", "b"),
      read: () => 50,
      keep: "a",
    });
    await answer("a", [5]);
    await answer("b", [5]);
    await done;
    const ex = exclusions$["201"].get();
    expect(ex.a).toBeUndefined();
    expect(ex.b.reason).toBe("outdated");
    expect(ex.b.updatedAt).toBe(probes$["201"].b.get().updatedAt);
  });

  it("the picked source with no match is auto-excluded and deselected", async () => {
    source$[201].set({ sourceId: "a", manga: null });
    const done = scan({ sources: sources("a", "b"), keep: "a" });
    await flush();
    searchPending.a([]);
    await answer("b", [5]);
    await done;
    expect(exclusions$["201"].get().a.reason).toBe("not-matched");
    expect(source$[201].get()).toBeUndefined();
  });

  it("a source picked during the scan is never auto-excluded", async () => {
    const done = scan({
      sources: sources("a", "b"),
      read: () => 50,
      keep: "a",
    });
    source$[201].set({ sourceId: "b" });
    await answer("a", [5]);
    await answer("b", [5]);
    await done;
    const ex = exclusions$["201"].get();
    expect(ex.b).toBeUndefined();
    expect(ex.a.reason).toBe("outdated");
  });

  it("auto-exclusion uses the read at the scan's end", async () => {
    let read = 0;
    const done = scan({
      sources: sources("a", "b"),
      read: () => read,
      keep: "a",
    });
    // the reader raises progress while the scan runs
    read = 50;
    await answer("a", [5]);
    await answer("b", [5]);
    await done;
    expect(exclusions$["201"].get()?.b?.reason).toBe("outdated");
  });

  it("an error must repeat", async () => {
    probes$["201"].a.set({
      provider: "a",
      providerName: "A",
      latest: 0,
      count: 0,
      matched: false,
      errored: true,
      updatedAt: 1,
    });
    probes$["201"].b.set({
      provider: "b",
      providerName: "B",
      latest: 9,
      count: 3,
      matched: true,
      errored: false,
      updatedAt: 1,
    });
    const done = scan({ sources: sources("a", "b") });
    await flush();
    // a search that returns a hit and then fails its chapters read is an error
    searchPending.a(["T"]);
    searchPending.b(["T"]);
    await flush();
    chaptersPending.a.reject(new Error("x"));
    chaptersPending.b.reject(new Error("x"));
    await done;
    const ex = exclusions$["201"].get();
    expect(ex.a.reason).toBe("error-found");
    expect(ex.b).toBeUndefined();
  });

  it("a rescan doesn't recheck expired exclusions", async () => {
    const old = {
      reason: "outdated" as const,
      updatedAt: Date.now() - 8 * 86_400_000,
    };
    exclusions$["201"].b.set(old);
    const done = scan({ sources: sources("a", "b"), only: ["a"] });
    await flush();
    expect(searchCalls).toEqual(["a"]);
    searchPending.a([]);
    await done;
    expect(exclusions$["201"].b.get()).toEqual(old);
  });

  it("scan all rechecks an expired auto-exclusion", async () => {
    exclusions$["201"].a.set({
      reason: "outdated",
      updatedAt: Date.now() - 8 * 86_400_000,
    });
    const done = scan({ sources: sources("a") });
    await answer("a", [40]);
    await done;
    expect(exclusions$["201"].a.get().deletedAt).toBeDefined();
  });
});
