import { beforeEach, describe, expect, it, mock } from "bun:test";
import { observable } from "@legendapp/state";
import { mockExtensions } from "@/features/extensions/utils/extensions.mock";
import { memoryStorage } from "../utils/chapter-storage/chapter-storage.mock";

// Titles whose search never answers, so the scan stays on them.
const held = new Set<string>();
// Sources that answer only after this many ms.
const late = new Map<string, number>();
const search = mock(async (sourceId: string, query: string) => {
  if (held.has(query)) await new Promise(() => {});
  if (late.has(sourceId)) await Bun.sleep(late.get(sourceId) ?? 0);
  return {
    mangas: [
      { url: `/${sourceId}/${query}`, title: query, thumbnailUrl: null },
    ],
    hasNextPage: false,
  };
});
const chapters = mock(async () => ({
  chapters: [
    { url: "/c/1", name: "Ch.1", number: 1, dateUpload: 0, scanlator: null },
  ],
}));
const installed$ = observable([
  {
    pkg: "pkg-a",
    name: "Source A",
    version: "1",
    lib: 1,
    signingKey: "",
    icon: null,
    sources: [{ id: "a", name: "Source A", lang: "en", homeUrl: null }],
  },
]);
mock.module("@/features/extensions", () =>
  mockExtensions({
    runtime: { search, chapters, challengedHosts: async () => [] },
    installed$,
  }),
);
const shown = mock(
  (_label: string, _options?: { action?: { onAction: () => void } }) => {},
);
mock.module("@/components/ui/toast", () => ({
  toast: Object.assign(shown, { error() {} }),
}));
const noop = () => {};
const startLibraryActivity = mock((_args: unknown) => ({
  manga: () => () => ({ progress: noop, mark: noop, end: noop }),
  finishing: noop,
  end: noop,
}));
mock.module("../utils/scan-activity", () => ({
  startScanActivity: () => ({ progress: noop, mark: noop, end: noop }),
  startLibraryActivity,
}));
const empty = async (): Promise<unknown> => ({ data: undefined });
let reply = empty;
const query = mock(() => reply());
mock.module("@/graphql/client", () => ({ client: { query } }));
const session$ = observable({ user: { id: 1 } as { id: number } | undefined });
mock.module("@/state/session", () => ({ session$ }));
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

const { scanManga, scanReading, stopReadingScan, retrySkipped, libraryScan$ } =
  await import("./library-scan");
const { readingQueue$, readingRun$ } = await import("./reading-queue");
const { stopScanAll } = await import("./probes");
const { source$ } = await import("./source");
const { probes$, turns } = await import("./probes");
const { toEntries } = await import("../utils/to-entries");
const { settings$ } = await import("@/state/settings");

const media = (id: number, title: string) => ({
  id,
  title: { userPreferred: title, romaji: title },
  synonyms: [],
  coverImage: { medium: `/${id}.jpg` },
  mediaListEntry: { id, progress: 0 },
});
const list = (...entries: ReturnType<typeof media>[]) => ({
  data: {
    MediaListCollection: {
      lists: [{ entries: entries.map((m) => ({ id: m.id, media: m })) }],
    },
  },
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  reply = empty;
  held.clear();
  late.clear();
  shown.mockClear();
  search.mockClear();
  query.mockClear();
  startLibraryActivity.mockClear();
  session$.user.set({ id: 1 });
  source$.set({});
  probes$.set({});
  // A held search never ends, and would keep its source's turn.
  turns.clear();
});

describe("scanReading", () => {
  it("no user or no entries", async () => {
    session$.user.set(undefined);
    await scanReading();
    expect(query).not.toHaveBeenCalled();
    session$.user.set({ id: 1 });
    reply = async () => list();
    await scanReading();
    expect(shown.mock.calls).toEqual([
      ["No manga in Reading"],
      ["No manga in Reading"],
    ]);
    expect(startLibraryActivity).not.toHaveBeenCalled();
  });

  it("no sources installed", async () => {
    const before = installed$.peek();
    installed$.set([]);
    reply = async () => list(media(407, "Seven"));
    await scanReading();
    installed$.set(before);
    expect(shown.mock.calls).toEqual([["No sources installed"]]);
    expect(startLibraryActivity).not.toHaveBeenCalled();
    expect(libraryScan$.get()).toBe(false);
  });

  it("a stop while the list loads ends quietly", async () => {
    let resolve = (_value: unknown) => {};
    reply = () => new Promise((r) => (resolve = r));
    const done = scanReading();
    stopReadingScan();
    resolve(list(media(408, "Eight")));
    await done;
    expect(startLibraryActivity).not.toHaveBeenCalled();
    expect(shown).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
    expect(libraryScan$.get()).toBe(false);
  });

  it("a second call while one runs does nothing", async () => {
    let resolve = (_value: unknown) => {};
    reply = () => new Promise((r) => (resolve = r));
    const first = scanReading();
    expect(libraryScan$.get()).toBe(true);
    await scanReading();
    expect(query).toHaveBeenCalledTimes(1);
    resolve(list());
    await first;
    expect(libraryScan$.get()).toBe(false);
  });

  it("undo restores every pick", async () => {
    const before = { sourceId: "b", manga: null, auto: true };
    source$[402].set(before);
    reply = async () => list(media(401, "One"), media(402, "Two"));
    await scanReading();
    expect(source$[401].get()).toMatchObject({ sourceId: "a", auto: true });
    expect(source$[402].get()).toMatchObject({ sourceId: "a", auto: true });
    expect(libraryScan$.get()).toBe(false);

    shown.mock.calls.at(-1)?.[1]?.action?.onAction();
    expect(source$[401].get()).toBeUndefined();
    expect(source$[402].get()).toEqual(before);
  });

  it("counts new chapters on any source, picked or not", async () => {
    settings$.sources.autoPick.set(false);
    reply = async () => list(media(409, "Nine"));
    await scanReading();
    settings$.sources.autoPick.set(true);
    expect(source$[409].get()).toBeUndefined();
    expect(shown.mock.calls.at(-1)?.[0]).toBe("1 with new chapters");
  });

  it("undo leaves a source picked by hand since", async () => {
    reply = async () => list(media(403, "Three"), media(404, "Four"));
    await scanReading();
    source$[403].set({ sourceId: "c" });

    shown.mock.calls.at(-1)?.[1]?.action?.onAction();
    expect(source$[403].get()).toEqual({ sourceId: "c" });
    expect(source$[404].get()).toBeUndefined();
  });

  it("a stop ends the manga in progress and the rest", async () => {
    held.add("Five");
    reply = async () => list(media(405, "Five"), media(406, "Six"));
    const done = scanReading();
    while (!search.mock.calls.length) await flush();
    stopReadingScan();
    await done;
    expect(search.mock.calls.map(([, title]) => title)).toEqual(["Five"]);
    // One source each, so Six started behind Five and waits for its turn.
    expect(shown.mock.calls.at(-1)?.[0]).toStartWith("Stopped at 2 of 2");
  });
});

describe("the Reading scan's queue", () => {
  const until = async (done: () => boolean) => {
    while (!done()) await Bun.sleep(2);
  };

  it("fills the queue and empties it at the end", async () => {
    held.add("Twenty");
    reply = async () => list(media(420, "Twenty"), media(421, "Twentyone"));
    const done = scanReading();
    await until(() => search.mock.calls.length > 0);
    expect(Object.values(readingQueue$.peek()).map((m) => m.mangaId)).toContain(
      420,
    );
    expect(readingRun$.peek()).not.toBeNull();
    stopReadingScan();
    await done;
    expect(readingQueue$.peek()).toEqual({});
    expect(readingRun$.peek()).toBeNull();
  });

  it("stopping one manga keeps the run going", async () => {
    held.add("Twentytwo");
    held.add("Twentythree");
    reply = async () =>
      list(media(422, "Twentytwo"), media(423, "Twentythree"));
    const done = scanReading();
    await until(() => search.mock.calls.length > 0);
    stopScanAll("422");
    await flush();
    expect(libraryScan$.get()).toBe(true);
    expect(
      Object.values(readingQueue$.peek()).map((m) => [m.mangaId, m.state]),
    ).toEqual([[423, "running"]]);
    stopReadingScan();
    await done;
  });

  it("clears the queue and the run when it throws", async () => {
    startLibraryActivity.mockImplementationOnce(() => ({
      manga: () => {
        throw new Error("boom");
      },
      finishing: noop,
      end: noop,
    }));
    reply = async () => list(media(424, "Twentyfour"));
    await expect(scanReading()).rejects.toThrow("boom");
    expect(readingQueue$.peek()).toEqual({});
    expect(readingRun$.peek()).toBeNull();
    expect(libraryScan$.get()).toBe(false);
  });

  it("a scan landing after the run threw doesn't bring the run back", async () => {
    let started = 0;
    startLibraryActivity.mockImplementationOnce(() => ({
      manga: () => {
        if (++started > 1) throw new Error("boom");
        return () => ({ progress: noop, mark: noop, end: noop });
      },
      finishing: noop,
      end: noop,
    }));
    late.set("a", 40);
    reply = async () =>
      list(media(427, "Twentyseven"), media(428, "Twentyeight"));
    await expect(scanReading()).rejects.toThrow("boom");
    expect(readingRun$.peek()).toBeNull();
    // Twentyseven's read lands now, with new chapters.
    await Bun.sleep(80);
    expect(readingRun$.peek()).toBeNull();
  });

  it("Retry scans only that source for the manga it missed", async () => {
    const before = installed$.peek();
    installed$.set([
      ...before,
      {
        ...before[0],
        pkg: "pkg-b",
        name: "Source B",
        sources: [{ id: "b", name: "Source B", lang: "en", homeUrl: null }],
      },
    ]);
    const slowSkip = settings$.sources.slowSkip.peek();
    settings$.sources.slowSkip.set(0.02);
    late.set("b", 60);
    // Every read of source a waits its turn, which isn't timed: the run stays
    // on both manga while b is skipped as slow.
    turns.set("a", new Promise(() => {}));
    try {
      reply = async () =>
        list(media(425, "Twentyfive"), media(426, "Twentysix"));
      const done = scanReading();
      await until(() => readingRun$.skipped.b.mangaIds.peek()?.length === 2);
      expect(readingRun$.skipped.b.peek()).toEqual({
        name: "Source B",
        mangaIds: [425, 426],
      });
      search.mockClear();
      retrySkipped("b");
      expect(readingRun$.skipped.b.peek()).toBeUndefined();
      stopScanAll("425");
      stopScanAll("426");
      await until(() => probes$["425"].b.peek() !== undefined);
      // Read past the limit and still kept: a retry has none.
      expect(probes$["425"].b.peek()?.matched).toBe(true);
      expect(search.mock.calls.every(([id]) => id === "b")).toBe(true);
      stopReadingScan();
      await done;
    } finally {
      installed$.set(before);
      settings$.sources.slowSkip.set(slowSkip);
    }
  });
});

const entry = (id: number, title: string) =>
  toEntries(list(media(id, title)).data as never)[0];

describe("scanManga", () => {
  it("skips a source checked within the hour unless everything", async () => {
    probes$["410"].a.set({
      provider: "a",
      providerName: "Source A",
      latest: 1,
      count: 1,
      matched: true,
      errored: false,
      updatedAt: Date.now() - 60_000,
    });
    await scanManga(entry(410, "Ten"), 0);
    expect(search).not.toHaveBeenCalled();
    expect(shown.mock.calls).toEqual([["Checked recently"]]);

    await scanManga(entry(410, "Ten"), 0, { everything: true });
    expect(search).toHaveBeenCalled();
    expect(
      shown.mock.calls.filter(([label]) => label === "Checked recently"),
    ).toHaveLength(1);
  });

  it("no sources installed", async () => {
    const before = installed$.peek();
    installed$.set([]);
    await scanManga(entry(411, "Eleven"), 0);
    installed$.set(before);
    expect(shown.mock.calls).toEqual([["No sources installed"]]);
    expect(search).not.toHaveBeenCalled();
  });
});
