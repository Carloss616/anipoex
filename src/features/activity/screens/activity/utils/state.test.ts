import { afterEach, describe, expect, mock, test } from "bun:test";

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

const { downloadQueue$ } = await import("@/features/downloads");
const { pendingEntries$ } = await import(
  "@/features/manga/state/pending-entries"
);
const {
  canMoveUp,
  corners,
  downloadIds,
  downloadsFailed,
  downloadsPending,
  downloadsView$,
  hasActivity,
  hasScans,
  unsentIds,
} = await import("./state");

type State = "queued" | "running" | "failed";
const entry = (key: string, order: number, state: State) => ({
  key,
  order,
  state,
  manga: { id: 41, title: "Manga" },
  source: { id: "source-1", name: "Source A" },
  chapter: { url: key, name: key, number: 1, scanlator: null, memo: null },
});

afterEach(() => {
  downloadQueue$.set({});
  pendingEntries$.set({});
});

describe("progress not sent", () => {
  test("lists only the entries that failed, as activity", () => {
    pendingEntries$.set({
      "901": { progress: 3, at: 1 },
      "902": { progress: 5, at: 1, error: "Denied" },
    });
    expect(unsentIds()).toBe("902");
    expect(hasActivity()).toBe(true);
    expect(hasScans()).toBe(false);
  });

  test("is no activity while every entry waits to be sent", () => {
    pendingEntries$.set({ "901": { progress: 3, at: 1 } });
    expect(unsentIds()).toBe("");
    expect(hasActivity()).toBe(false);
  });
});

describe("corners", () => {
  test("keeps only the first, middle, last or only row's place", () => {
    expect(corners(0, 1)).toEqual({ index: 0, count: 1 });
    expect(corners(0, 5)).toEqual({ index: 0, count: 2 });
    expect(corners(2, 5)).toEqual({ index: 1, count: 3 });
    expect(corners(3, 5)).toEqual({ index: 1, count: 3 });
    expect(corners(4, 5)).toEqual({ index: 1, count: 2 });
  });
});

describe("downloads", () => {
  test("count as activity on their own, not as scans", () => {
    expect(hasActivity()).toBe(false);
    downloadQueue$.k1.set(entry("k1", 0, "queued"));
    expect(hasActivity()).toBe(true);
    expect(hasScans()).toBe(false);
  });

  test("are pending while one isn't failed", () => {
    downloadQueue$.k1.set(entry("k1", 0, "failed"));
    expect(downloadsPending()).toBe(false);
    downloadQueue$.k2.set(entry("k2", 1, "queued"));
    expect(downloadsPending()).toBe(true);
  });

  test("have failed ones while any entry failed", () => {
    downloadQueue$.k1.set(entry("k1", 0, "queued"));
    expect(downloadsFailed()).toBe(false);
    downloadQueue$.k2.set(entry("k2", 1, "failed"));
    expect(downloadsFailed()).toBe(true);
  });

  test("list every entry by order", () => {
    downloadQueue$.set({
      k1: entry("k1", 2, "failed"),
      k2: entry("k2", 0, "running"),
      k3: entry("k3", 1, "queued"),
    });
    expect(downloadIds()).toBe("k2,k3,k1");
  });

  test("move up only past a queued entry", () => {
    downloadQueue$.set({
      k1: entry("k1", 0, "running"),
      k2: entry("k2", 1, "queued"),
      k3: entry("k3", 2, "failed"),
      k4: entry("k4", 3, "queued"),
    });
    expect(canMoveUp("k2")).toBe(false);
    expect(canMoveUp("k4")).toBe(true);
    expect(canMoveUp("k3")).toBe(false);
    expect(canMoveUp("missing")).toBe(false);
  });

  test("track the first queued one as the queue changes", () => {
    downloadQueue$.set({
      k1: entry("k1", 0, "running"),
      k2: entry("k2", 1, "queued"),
      k3: entry("k3", 2, "queued"),
    });
    expect(downloadsView$.firstQueued.get()).toBe("k2");
    downloadQueue$.k2.state.set("failed");
    expect(downloadsView$.firstQueued.get()).toBe("k3");
    expect(canMoveUp("k3")).toBe(false);
    downloadQueue$.k1.assign({ state: "queued", order: 3 });
    expect(canMoveUp("k1")).toBe(true);
    downloadQueue$.set({});
    expect(downloadsView$.firstQueued.get()).toBe("");
  });
});
