import { beforeEach, describe, expect, it, mock } from "bun:test";
import { observable } from "@legendapp/state";
import { mockExtensions } from "@/features/extensions/utils/extensions.mock";
import { memoryStorage } from "../utils/chapter-storage/chapter-storage.mock";

// Titles whose search never answers, so the scan stays on them.
const held = new Set<string>();
const search = mock(async (sourceId: string, query: string) => {
  if (held.has(query)) await new Promise(() => {});
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

const { scanReading, stopReadingScan, libraryScan$ } = await import(
  "./library-scan"
);
const { source$ } = await import("./source");
const { probes$ } = await import("./probes");
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
  shown.mockClear();
  search.mockClear();
  query.mockClear();
  startLibraryActivity.mockClear();
  session$.user.set({ id: 1 });
  source$.set({});
  probes$.set({});
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
