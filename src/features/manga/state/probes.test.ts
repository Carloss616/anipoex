import { beforeEach, describe, expect, it, jest, mock } from "bun:test";
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
          thumbnailUrl: `/${sourceId}.jpg`,
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

let hostsReply = async (): Promise<string[]> => [];
mock.module("@/features/extensions", () => ({
  runtime: { search, chapters, challengedHosts: () => hostsReply() },
}));
const shown = mock(
  (_label: string, _options?: { action?: { onAction: () => void } }) => {},
);
mock.module("@/components/ui/toast", () => ({
  toast: Object.assign(shown, { error() {} }),
}));
const activity = {
  progress: mock((_done: number) => {}),
  end: mock((_found: number) => {}),
  mark: mock((_id: string, _mark: unknown) => {}),
};
const startScanActivity = mock((_args: unknown) => activity);
mock.module("../utils/scan-activity", () => ({ startScanActivity }));
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

const { exclusions$, pins$, decideByHand } = await import("./exclusions");
const { source$ } = await import("./source");
const {
  probes$,
  scanning$,
  scanningAll$,
  scanProgress$,
  scanSources,
  probeSource,
  isScanning,
  stopScan,
  stopScanAll,
} = await import("./probes");
const { fetchChapters } = await import("../utils/fetch-chapters");
const { PARALLEL_BATCH, RECENT_SCAN_MS } = await import("../utils/msu");
const { clearManual, readManual, setManual } = await import("./manual-matches");
const { titleSearch$ } = await import("./title-search");
const { forgetByTitle, takeByTitle } = await import("./title-takes");
const { settings$ } = await import("@/state/settings");

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
/** Answers a source's search with a hit and chapters with the given numbers. */
async function answer(id: string, numbers: number[]) {
  await flush();
  searchPending[id](["T"]);
  await flush();
  chaptersPending[id].resolve({
    chapters: numbers.map((n) => ch(`c${n}`, n)),
  });
}

beforeEach(() => {
  startScanActivity.mockClear();
  activity.progress.mockClear();
  activity.end.mockClear();
  activity.mark.mockClear();
  shown.mockClear();
  search.mockClear();
  chapters.mockClear();
  searchCalls.length = 0;
  chaptersCalls.length = 0;
  probes$.set({});
  scanning$.set({});
  scanningAll$.set({});
  scanProgress$.set({});
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
      manga: { url: "/a", title: "T", thumbnailUrl: "/a.jpg" },
      chapters: [ch("Ch.12", 12), ch("Chapter 13", -1)],
    });
  });

  it("reads the manual page instead of searching", async () => {
    setManual(1005, "m", { url: "/mine", title: "Mine", thumbnailUrl: null });
    const done = probeSource(1005, { id: "m", name: "M" }, titles);
    await flush();
    expect(searchCalls).not.toContain("m");
    expect(chaptersCalls).toContain("m/mine");
    chaptersPending.m.resolve({ chapters: [ch("Ch.3", 3)] });
    expect(await done).toMatchObject({ matched: true, latest: 3 });
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
    const done = probeSource(201, { id: "h", name: "H" }, titles, 20, 20);
    await flush();
    // its own source id, so the hung read never meets another test's load
    searchPending.h(["T"]);
    expect(await done).toMatchObject({ errored: true, matched: false });
  });

  it("a probe shares the detail's chapter load", async () => {
    const detail = fetchChapters("a", { url: "/a", title: "T" });
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

  it("a stopped source frees its row and keeps its last probe", async () => {
    probes$["201"].b.set({ latest: 7 } as never);
    const done = scan({ sources: sources("a", "b") });
    await flush();
    stopScan("201", "b");
    expect(scanning$["201"].b.get()).toBeUndefined();
    await answer("a", [3]);
    await done;
    expect(probes$["201"].b.get()?.latest).toBe(7);
    expect(probes$["201"].a.get()?.latest).toBe(3);
    expect(activity.progress).toHaveBeenLastCalledWith(2);
    // The stopped call answering late changes nothing.
    searchPending.b([]);
    await flush();
    expect(probes$["201"].b.get()?.latest).toBe(7);
  });

  it("a source stopped before its batch is never read", async () => {
    const ids = Array.from({ length: PARALLEL_BATCH + 1 }, (_, i) => `s${i}`);
    const last = ids[PARALLEL_BATCH];
    const done = scan({ sources: sources(...ids) });
    await flush();
    stopScan("201", last);
    for (const id of ids.slice(0, PARALLEL_BATCH)) searchPending[id]([]);
    await done;
    expect(searchCalls).not.toContain(last);
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

  it("a Scan all during a rescan probes every other source", async () => {
    const rescan = scan({ sources: sources("a", "b", "c"), only: ["a"] });
    await flush();
    const all = scan({ sources: sources("a", "b", "c") });
    await flush();
    expect(searchCalls).toEqual(["a", "b", "c"]);
    expect(startScanActivity).toHaveBeenLastCalledWith(
      expect.objectContaining({ total: 2 }),
    );
    searchPending.a([]);
    await rescan;
    // The rescan ending leaves the Scan all's flag on.
    expect(scanningAll$["201"].get()).toBe(true);
    searchPending.b([]);
    searchPending.c([]);
    await all;
    expect(scanningAll$["201"].get()).toBeUndefined();
    expect(scanning$["201"].get()).toEqual({});
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

  it("a scan all flags the manga and counts landings until it ends", async () => {
    const done = scan({ sources: sources("a", "b") });
    await flush();
    expect(scanningAll$["201"].get()).toBe(true);
    expect(scanProgress$["201"].get()).toEqual({ done: 0, total: 2 });
    searchPending.a([]);
    await flush();
    expect(scanningAll$["201"].get()).toBe(true);
    expect(scanProgress$["201"].get()).toEqual({ done: 1, total: 2 });
    searchPending.b([]);
    await done;
    expect(scanningAll$["201"].get()).toBeUndefined();
    expect(scanProgress$["201"].get()).toBeUndefined();
  });

  it("a scan reports each landing and ends with its matches", async () => {
    const done = scan({ sources: sources("a", "b") });
    await answer("a", [1]);
    searchPending.b([]);
    await done;
    expect(startScanActivity).toHaveBeenCalledWith({
      mangaId: 201,
      name: "T",
      total: 2,
      source: undefined,
      cover: undefined,
      sources: sources("a", "b").map((s) => ({ ...s, state: "pending" })),
      onStop: expect.any(Function),
    });
    expect(activity.progress.mock.calls).toEqual([[1], [2]]);
    expect(activity.end.mock.calls).toEqual([[1]]);
  });

  it("a rescan names its source and ends even when the probe fails", async () => {
    const done = scan({ sources: sources("a", "b"), only: ["a"] });
    await flush();
    searchPending.a(["T"]);
    await flush();
    chaptersPending.a.reject(new Error("down"));
    await done;
    expect(startScanActivity).toHaveBeenCalledWith(
      expect.objectContaining({ total: 1, source: sources("a")[0] }),
    );
    expect(activity.end.mock.calls).toEqual([[0]]);
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

  it("the picked source with no match is auto-excluded, and the best source takes its place", async () => {
    source$[201].set({ sourceId: "a", manga: null });
    const done = scan({ sources: sources("a", "b"), keep: "a" });
    await flush();
    searchPending.a([]);
    await answer("b", [5]);
    await done;
    await flush();
    expect(exclusions$["201"].get().a.reason).toBe("not-matched");
    expect(source$[201].get()).toMatchObject({ sourceId: "b" });
  });

  it("a scan replaces its own pick with a better source, and Undo puts it back", async () => {
    const before = {
      sourceId: "a",
      manga: { url: "/a", title: "T" },
      auto: true,
    };
    source$[201].set(before);
    const done = scan({ sources: sources("a", "b"), keep: "a" });
    await answer("a", [5]);
    await answer("b", [9]);
    await done;
    expect(source$[201].get()).toMatchObject({ sourceId: "b", auto: true });
    expect(shown.mock.calls.at(-1)?.[0]).toBe("Picked B · +9");

    shown.mock.calls.at(-1)?.[1]?.action?.onAction();
    expect(source$[201].get()).toEqual(before);
  });

  it("a late Undo leaves a pick the user made after the scan", async () => {
    const done = scan({ sources: sources("a") });
    await answer("a", [3]);
    await done;
    source$[201].set({ sourceId: "c" });

    shown.mock.calls.at(-1)?.[1]?.action?.onAction();
    expect(source$[201].get()).toEqual({ sourceId: "c" });
  });

  it("a scan never replaces a pick made by hand", async () => {
    source$[201].set({ sourceId: "a", manga: { url: "/a", title: "T" } });
    const done = scan({ sources: sources("a", "b"), keep: "a" });
    await answer("a", [5]);
    await answer("b", [9]);
    await done;
    expect(source$[201].get()).toMatchObject({ sourceId: "a" });
  });

  it("Undo of a first pick leaves the manga with no source", async () => {
    const done = scan({ sources: sources("a") });
    await answer("a", [3]);
    await done;
    expect(source$[201].get()).toMatchObject({ sourceId: "a", auto: true });

    shown.mock.calls.at(-1)?.[1]?.action?.onAction();
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

  it("auto-exclusion uses the read when the source lands", async () => {
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

  it("a source is judged as it lands, not when the others end", async () => {
    const done = scan({ sources: sources("a", "b") });
    await flush();
    searchPending.a([]);
    await flush();
    expect(exclusions$["201"].a.get().reason).toBe("not-matched");
    expect(scanning$["201"].b.get()).toBe(true);
    await answer("b", [5]);
    await done;
  });

  it("a rescan of a source excluded by itself checks it again", async () => {
    exclusions$["201"].a.set({ reason: "not-matched", updatedAt: Date.now() });
    const done = scan({ sources: sources("a"), only: ["a"] });
    await answer("a", [5]);
    await done;
    expect(exclusions$["201"].a.get().deletedAt).toBeDefined();
  });

  it("a rescan leaves a source excluded by hand excluded", async () => {
    exclusions$["201"].a.set({ reason: "other", updatedAt: 1 });
    pins$["201"].a.set({ updatedAt: 1 });
    const done = scan({ sources: sources("a"), only: ["a"] });
    await answer("a", [5]);
    await done;
    expect(exclusions$["201"].a.get().deletedAt).toBeUndefined();
  });

  it("a rechecked source included during the scan stays included", async () => {
    exclusions$["201"].a.set({
      reason: "not-matched",
      updatedAt: Date.now() - 8 * 86_400_000,
    });
    const done = scan({ sources: sources("a", "b") });
    await flush();
    searchPending.a([]);
    await flush();
    decideByHand(201, "a", false, "other");
    await answer("b", [5]);
    await done;
    expect(exclusions$["201"].a.get().deletedAt).toBeDefined();
    expect(pins$["201"].a.get().deletedAt).toBeUndefined();
  });

  it("returns scanned false when nothing is left to scan", async () => {
    exclusions$["201"].a.set({ reason: "other", updatedAt: Date.now() });
    expect(await scan()).toEqual({ scanned: false });
    expect(startScanActivity).not.toHaveBeenCalled();
  });

  it("returns scanned false when a Scan all already runs", async () => {
    const first = scan();
    await flush();
    expect(await scan()).toEqual({ scanned: false });
    searchPending.a([]);
    await first;
  });

  it("freshFor skips sources probed within it", async () => {
    const probe = (id: string, updatedAt: number) => ({
      provider: id,
      providerName: id,
      latest: 1,
      count: 1,
      matched: true,
      errored: false,
      updatedAt,
    });
    probes$["201"].a.set(probe("a", Date.now() - 1000));
    probes$["201"].b.set(probe("b", Date.now() - 2 * RECENT_SCAN_MS));
    const done = scan({
      sources: sources("a", "b"),
      freshFor: RECENT_SCAN_MS,
    });
    await flush();
    expect(searchCalls).toEqual(["b"]);
    expect(startScanActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 1,
        sources: [expect.objectContaining({ id: "b", state: "pending" })],
      }),
    );
    searchPending.b([]);
    await done;
  });

  it("returns scanned false when every target is fresh", async () => {
    probes$["201"].a.set({
      provider: "a",
      providerName: "A",
      latest: 1,
      count: 1,
      matched: true,
      errored: false,
      updatedAt: Date.now() - 1000,
    });
    expect(await scan({ freshFor: RECENT_SCAN_MS })).toEqual({
      scanned: false,
    });
    expect(startScanActivity).not.toHaveBeenCalled();
    expect(searchCalls).toEqual([]);
  });

  it("an injected activity replaces startScanActivity and the pick toast", async () => {
    const before = {
      sourceId: "a",
      manga: { url: "/a", title: "T" },
      auto: true,
    };
    source$[201].set(before);
    const done = scan({ sources: sources("a", "b"), keep: "a", activity });
    await answer("a", [5]);
    await answer("b", [9]);
    const result = await done;
    expect(startScanActivity).not.toHaveBeenCalled();
    expect(shown).not.toHaveBeenCalled();
    expect(result).toEqual({ scanned: true, picked: { previous: before } });
  });

  it("marks each source scanning, then by its probe", async () => {
    const done = scan({ read: () => 0 });
    await flush();
    expect(activity.mark.mock.calls).toEqual([["a", { state: "scanning" }]]);
    await answer("a", [1, 2, 3]);
    await done;
    expect(activity.mark).toHaveBeenLastCalledWith("a", {
      state: "found",
      unread: 3,
    });
  });

  it("stopScanAll frees every running source", async () => {
    const last = {
      provider: "b",
      providerName: "B",
      latest: 7,
      count: 7,
      matched: true,
      errored: false,
      updatedAt: 1,
    };
    probes$["201"].b.set(last);
    const done = scan({ sources: sources("a", "b"), read: () => 5 });
    await flush();
    stopScanAll("201");
    expect(isScanning(201)).toBe(false);
    await done;
    expect(probes$["201"].b.get()).toEqual(last);
    expect(probes$["201"].a.get()).toBeUndefined();
    // Each stopped source shows its last probe, or pending without one.
    expect(activity.mark).toHaveBeenCalledWith("a", { state: "pending" });
    expect(activity.mark).toHaveBeenCalledWith("b", {
      state: "found",
      unread: 2,
    });
  });

  it("without an activity, the pick toast still shows", async () => {
    const done = scan();
    await answer("a", [3]);
    expect((await done).picked).toEqual({ previous: undefined });
    expect(shown.mock.calls.at(-1)?.[0]).toBe("Picked A · +3");
  });
});

describe("a manual page removed while it is read", () => {
  it("stores none of its chapters", async () => {
    setManual(1301, "m", { url: "/gone", title: "Gone", thumbnailUrl: null });
    const done = probeSource(1301, { id: "m", name: "M" }, titles);
    await flush();
    clearManual(1301, "m");
    chaptersPending.m.resolve({ chapters: [ch("Ch.3", 3)] });
    expect(await done).toMatchObject({ matched: false });
    await flush();
    expect(memoryStorage.entries["1301/m"]).toBeUndefined();
  });
});

describe("title takes", () => {
  const rail = (title: string) => ({
    status: "done" as const,
    mangas: [{ url: `/${title}`, title, thumbnailUrl: null }],
    page: 1,
    hasNextPage: false,
    loadingMore: false,
  });
  const named = (id: string) => ({ id, name: id.toUpperCase() });
  const known = { search: [], all: ["Dark Lady"] };

  it("takes a known title in the loaded results of sources free to take it", () => {
    titleSearch$["1401"].set({
      a: rail("Dark Lady"),
      b: rail("Dark Lady"),
      c: rail("Dark Lady"),
      d: rail("Dark Lady"),
      e: rail("Dark Lady"),
      g: rail("Dark Lady"),
      f: rail("Other"),
    });
    scanning$["1401"].b.set(true);
    setManual(1401, "c", { url: "/mine", title: "Mine", thumbnailUrl: null });
    probes$["1401"].d.set({
      provider: "d",
      providerName: "D",
      latest: 9,
      count: 9,
      matched: true,
      errored: false,
      updatedAt: 1,
    });
    exclusions$["1401"].set({
      e: { reason: "other", updatedAt: 1 },
      g: { reason: "not-matched", updatedAt: 1 },
    });
    pins$["1401"].set({ e: { updatedAt: 1 } });
    expect(takeByTitle(1401, known, named)).toEqual(["a", "g"]);
    expect(readManual(1401, "a")).toMatchObject({
      url: "/Dark Lady",
      by: "title",
    });
    expect(readManual(1401, "e")).toBeUndefined();
  });

  it("forgets a take for good and leaves a match picked by hand alone", () => {
    titleSearch$["1402"].set({ a: rail("Dark Lady") });
    expect(takeByTitle(1402, known, named)).toEqual(["a"]);
    forgetByTitle(1402, "a", named);
    expect(readManual(1402, "a")).toBeUndefined();
    expect(probes$["1402"].a.peek()).toMatchObject({ matched: false });
    expect(takeByTitle(1402, known, named)).toEqual([]);
    setManual(1402, "c", { url: "/mine", title: "Mine", thumbnailUrl: null });
    forgetByTitle(1402, "c", named);
    expect(readManual(1402, "c")?.url).toBe("/mine");
  });

  it("keeps a scan's pick automatic when its take is forgotten", () => {
    titleSearch$["1403"].set({ a: rail("Dark Lady") });
    takeByTitle(1403, known, named);
    source$[1403].set({
      sourceId: "a",
      manga: { url: "/Dark Lady", title: "Dark Lady" },
      auto: true,
    });
    forgetByTitle(1403, "a", named);
    expect(source$[1403].peek()).toEqual({
      sourceId: "a",
      manga: null,
      auto: true,
    });
  });
});

describe("auto pick", () => {
  it("picks the best source when a scan ends and none is chosen", async () => {
    const done = scan({ mangaId: 1501, sources: sources("a", "b") });
    await answer("a", [1, 2]);
    await answer("b", [1, 2, 3]);
    await done;
    await flush();
    expect(source$[1501].peek()).toMatchObject({
      sourceId: "b",
      manga: { url: "/b" },
    });
  });

  it("leaves out +N when the pick has nothing new", async () => {
    const done = scan({ mangaId: 1503, sources: sources("a"), read: () => 2 });
    await answer("a", [1, 2]);
    await done;
    expect(shown.mock.calls.at(-1)?.[0]).toBe("Picked A");
  });

  it("picks nothing when auto-pick is off", async () => {
    settings$.sources.autoPick.set(false);
    try {
      const done = scan({ mangaId: 1504, sources: sources("a") });
      await answer("a", [1]);
      await done;
      expect(source$[1504].peek()).toBeUndefined();
    } finally {
      settings$.sources.autoPick.set(true);
    }
  });

  it("picks even when the runtime never says which hosts challenged", async () => {
    hostsReply = () => new Promise(() => {});
    try {
      const done = scan({ mangaId: 1505, sources: sources("a") });
      await answer("a", [1]);
      jest.useFakeTimers();
      for (let i = 0; i < 20; i++) await Promise.resolve();
      jest.advanceTimersByTime(10_000);
      jest.useRealTimers();
      // Bounded, so a scan stuck on the runtime fails here instead of hanging.
      await Promise.race([done, new Promise((r) => setTimeout(r, 500))]);
      expect(source$[1505].peek()).toMatchObject({ sourceId: "a" });
    } finally {
      jest.useRealTimers();
      hostsReply = async () => [];
    }
  });

  it("keeps a source the user chose", async () => {
    source$[1502].set({ sourceId: "a", manga: { url: "/a", title: "T" } });
    const done = scan({ mangaId: 1502, sources: sources("a", "b") });
    await answer("a", [1]);
    await answer("b", [1, 2, 3]);
    await done;
    await flush();
    expect(source$[1502].peek()).toMatchObject({ sourceId: "a" });
  });
});

describe("title takes and the search", () => {
  const rail = (title: string) => ({
    status: "done" as const,
    mangas: [{ url: `/${title}`, title, thumbnailUrl: null }],
    page: 1,
    hasNextPage: false,
    loadingMore: false,
  });
  const named = (id: string) => ({ id, name: id.toUpperCase() });

  it("ends the title search of the sources it takes", () => {
    titleSearch$["1601"].set({ a: rail("Dark Lady"), b: rail("Other") });
    takeByTitle(1601, { search: [], all: ["Dark Lady"] }, named);
    expect(titleSearch$["1601"].a.peek()).toBeUndefined();
    expect(titleSearch$["1601"].b.peek()).toBeDefined();
  });

  it("leaves the chosen source picked, with no match, when its take is undone", () => {
    titleSearch$["1602"].set({ a: rail("Dark Lady") });
    takeByTitle(1602, { search: [], all: ["Dark Lady"] }, named);
    source$[1602].set({
      sourceId: "a",
      manga: { url: "/Dark Lady", title: "Dark Lady" },
    });
    forgetByTitle(1602, "a", named);
    expect(source$[1602].peek()).toEqual({ sourceId: "a", manga: null });
  });
});
