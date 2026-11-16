import { afterEach, describe, expect, it, mock } from "bun:test";

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

const { downloadQueue$, downloaded$ } = await import("../state/download-queue");
const { chapterHash, downloadKey } = await import("./paths");
const { downloadStateOf } = await import("./download-state");

const URL = "https://example.com/chapter-1";
const hash = chapterHash(URL);
const key = downloadKey(271, "1234", hash);

const queue = (state: "queued" | "running" | "failed") =>
  downloadQueue$[key].set({
    key,
    order: 0,
    state,
    manga: { id: 271, title: "Manga" },
    source: { id: "1234", name: "Source A" },
    chapter: { url: URL, name: "1", number: 1, scanlator: null, memo: null },
  });

afterEach(() => {
  downloadQueue$.set({});
  downloaded$.set({});
});

describe("downloadStateOf", () => {
  it("takes the queue entry's state", () => {
    for (const state of ["running", "queued", "failed"] as const) {
      queue(state);
      expect(downloadStateOf(271, "1234", URL)).toBe(state);
    }
  });

  it("says where a downloaded chapter lives", () => {
    downloaded$["271/1234"][hash].set("local");
    expect(downloadStateOf(271, "1234", URL)).toBe("local");
    downloaded$["271/1234"][hash].set("cloud");
    expect(downloadStateOf(271, "1234", URL)).toBe("cloud");
  });

  it("puts the queue before a file already there", () => {
    downloaded$["271/1234"][hash].set("local");
    queue("running");
    expect(downloadStateOf(271, "1234", URL)).toBe("running");
  });

  it("is none otherwise", () => {
    downloaded$["271/1234"].other.set("local");
    expect(downloadStateOf(271, "1234", URL)).toBe("none");
    expect(downloadStateOf(271, "9999", URL)).toBe("none");
  });
});
