import { beforeEach, describe, expect, it, mock } from "bun:test";
import { observable } from "@legendapp/state";
import { toSources, withChosen } from "@/features/extensions/utils/sources";
import { memoryStorage } from "../utils/chapter-storage/chapter-storage.mock";

const search = mock(async (sourceId: string, query: string) => ({
  mangas: [{ url: `/${sourceId}/${query}`, title: query, thumbnailUrl: null }],
  hasNextPage: false,
}));
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
mock.module("@/features/extensions", () => ({
  runtime: { search, chapters, challengedHosts: async () => [] },
  installed$,
  installedLoaded$: observable(true),
  refreshInstalled: async () => {},
  toSources,
  withChosen,
}));
const shown = mock(
  (_label: string, _options?: { action?: { onAction: () => void } }) => {},
);
mock.module("@/components/ui/toast", () => ({
  toast: Object.assign(shown, { error() {} }),
}));
const noop = () => {};
const startLibraryActivity = mock((_args: unknown) => ({
  manga: () => ({ progress: noop, mark: noop, end: noop }),
  end: noop,
}));
mock.module("../utils/scan-activity", () => ({
  startScanActivity: () => ({ progress: noop, mark: noop, end: noop }),
  startLibraryActivity,
}));
let reply: () => Promise<unknown> = async () => ({ data: undefined });
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

const { scanReading, libraryScan$ } = await import("./library-scan");
const { source$ } = await import("./source");
const { probes$ } = await import("./probes");

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

beforeEach(() => {
  shown.mockClear();
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
    session$.user.set({ id: 1 });
    reply = async () => list();
    await scanReading();
    expect(shown.mock.calls).toEqual([
      ["No manga in Reading"],
      ["No manga in Reading"],
    ]);
    expect(startLibraryActivity).not.toHaveBeenCalled();
  });

  it("a second call while one runs does nothing", async () => {
    let resolve = (_value: unknown) => {};
    reply = () => new Promise((r) => (resolve = r));
    const first = scanReading();
    await scanReading();
    expect(query).toHaveBeenCalledTimes(1);
    resolve(list());
    await first;
    expect(libraryScan$.get()).toBeNull();
  });

  it("undo restores every pick", async () => {
    const before = { sourceId: "b", manga: null, auto: true };
    source$[402].set(before);
    reply = async () => list(media(401, "One"), media(402, "Two"));
    await scanReading();
    expect(source$[401].get()).toMatchObject({ sourceId: "a", auto: true });
    expect(source$[402].get()).toMatchObject({ sourceId: "a", auto: true });
    expect(libraryScan$.get()).toBeNull();

    shown.mock.calls.at(-1)?.[1]?.action?.onAction();
    expect(source$[401].get()).toBeUndefined();
    expect(source$[402].get()).toEqual(before);
  });
});
