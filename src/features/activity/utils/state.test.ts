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
const { corners, downloadsPending } = await import("./state");

type State = "queued" | "running" | "failed";
const entry = (key: string, order: number, state: State) => ({
  key,
  order,
  state,
  manga: { id: 42, title: "Manga" },
  source: { id: "source-1", name: "Source A" },
  chapter: { url: key, name: key, number: 1, scanlator: null, memo: null },
});

afterEach(() => {
  downloadQueue$.set({});
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
  test("are pending while one isn't failed", () => {
    downloadQueue$.p1.set(entry("p1", 0, "failed"));
    expect(downloadsPending()).toBe(false);
    downloadQueue$.p2.set(entry("p2", 1, "queued"));
    expect(downloadsPending()).toBe(true);
  });
});
