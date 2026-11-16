import { afterAll, describe, expect, it, mock } from "bun:test";
import { batch } from "@legendapp/state";

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

const calls: unknown[][] = [];
const starts = mock((_onPause: () => void) => {
  calls.push(["start"]);
  return {
    update: (now: unknown) => calls.push(["update", now]),
    end: (summary: unknown) => calls.push(["end", summary]),
  };
});
mock.module("../utils/download-activity", () => ({
  startDownloadActivity: starts,
}));

const {
  downloaded$,
  downloadProgress$,
  downloadQueue$,
  downloadsPaused$,
  enqueue,
} = await import("./download-queue");
const { pauseDownloads } = await import("./run-downloads");
const { syncDownloadActivity } = await import("./download-activity-sync");
const { chapterHash, downloadKey } = await import("../utils/paths");

const SOURCE = "source-sync";
const item = (url: string, number: number) => ({
  manga: { id: 77, title: "Manga" },
  source: { id: SOURCE, name: "Source A" },
  chapter: { url, name: url, number, scanlator: null, memo: null },
});
const keyOf = (url: string) => downloadKey(77, SOURCE, chapterHash(url));
const finish = (url: string) =>
  batch(() => {
    downloadQueue$[keyOf(url)].delete();
    downloadProgress$[keyOf(url)].delete();
    downloaded$[`77/${SOURCE}`][chapterHash(url)].set("local");
  });
const take = () => calls.splice(0);

const dispose = syncDownloadActivity();

afterAll(() => {
  dispose();
  batch(() => {
    for (const url of ["a", "b", "c"]) downloadQueue$[keyOf(url)].delete();
    downloaded$[`77/${SOURCE}`].delete();
    downloadsPaused$.set(false);
  });
});

describe("syncDownloadActivity", () => {
  it("runs one activity through enqueue, progress, pause, resume and the end", () => {
    enqueue([item("a", 1), item("b", 2)]);
    expect(take()).toEqual([
      ["start"],
      [
        "update",
        { title: "Manga · Chapter 1", done: 0, total: 2, fraction: 0 },
      ],
    ]);
    expect(starts.mock.calls[0][0]).toBe(pauseDownloads);

    batch(() => {
      downloadQueue$[keyOf("a")].state.set("running");
      downloadProgress$[keyOf("a")].set(0.5);
    });
    expect(take()).toEqual([
      [
        "update",
        { title: "Manga · Chapter 1", done: 0, total: 2, fraction: 0.5 },
      ],
    ]);

    finish("a");
    expect(take()).toEqual([
      [
        "update",
        { title: "Manga · Chapter 2", done: 1, total: 2, fraction: 0 },
      ],
    ]);

    downloadsPaused$.set(true);
    expect(take()).toEqual([["end", { done: 1, failed: 0, paused: true }]]);

    // The resume starts a new activity that keeps counting.
    downloadsPaused$.set(false);
    expect(take()).toEqual([
      ["start"],
      [
        "update",
        { title: "Manga · Chapter 2", done: 1, total: 2, fraction: 0 },
      ],
    ]);

    finish("b");
    expect(take()).toEqual([["end", { done: 2, failed: 0, paused: false }]]);

    // Empty, the next activity counts from zero.
    enqueue([item("c", 3)]);
    expect(take()).toEqual([
      ["start"],
      [
        "update",
        { title: "Manga · Chapter 3", done: 0, total: 1, fraction: 0 },
      ],
    ]);
    downloadQueue$[keyOf("c")].delete();
    expect(take()).toEqual([["end", { done: 0, failed: 0, paused: false }]]);
  });
});
