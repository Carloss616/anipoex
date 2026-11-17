import { describe, expect, it, mock } from "bun:test";

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

const { downloaded$ } = await import("./download-queue");
const { loadDownloaded, refreshDownloaded } = await import("./downloaded");

const fake = (files: { hash: string; local: boolean }[]) =>
  ({ list: async () => files.map((f) => ({ ...f, paths: [] })) }) as never;

describe("refreshDownloaded", () => {
  it("maps the listed hashes to local or cloud", async () => {
    await refreshDownloaded(
      21,
      "1234",
      fake([
        { hash: "a1b2c3d4", local: true },
        { hash: "9f8e7d6c", local: false },
      ]),
    );
    expect(downloaded$.peek()["21/1234"]).toEqual({
      a1b2c3d4: "local",
      "9f8e7d6c": "cloud",
    });
  });

  it("drops a file that vanished, and the key when none is left", async () => {
    await refreshDownloaded(
      21,
      "1234",
      fake([{ hash: "a1b2c3d4", local: true }]),
    );
    expect(downloaded$.peek()["21/1234"]).toEqual({ a1b2c3d4: "local" });
    await refreshDownloaded(21, "1234", fake([]));
    expect(downloaded$.peek()["21/1234"]).toBeUndefined();
  });

  it("keeps a chapter that finished while the store was listing", async () => {
    await refreshDownloaded(7, "s", fake([{ hash: "aaaaaaaa", local: true }]));
    let resolve: (files: unknown[]) => void = () => {};
    const slow = {
      list: () => new Promise((done) => (resolve = done)),
    } as never;
    const refreshing = refreshDownloaded(7, "s", slow);
    downloaded$["7/s"].bbbbbbbb.set("local");
    resolve([]);
    await refreshing;
    expect(downloaded$.peek()["7/s"]).toEqual({ bbbbbbbb: "local" });
  });

  it("keeps the previous value when listing fails", async () => {
    await refreshDownloaded(5, "s", fake([{ hash: "aaaaaaaa", local: true }]));
    const failing = {
      list: async () => {
        throw new Error("boom");
      },
    } as never;
    await expect(refreshDownloaded(5, "s", failing)).rejects.toThrow("boom");
    expect(downloaded$.peek()["5/s"]).toEqual({ aaaaaaaa: "local" });
  });
});

describe("loadDownloaded", () => {
  it("lists each manga and source that has files", async () => {
    const listed: string[] = [];
    await loadDownloaded({
      listAll: async () => [
        "downloads/A [7]/Source A [s1]/Ch 1 [aaaaaaaa].cbz",
        "downloads/A [7]/Source A [s1]/Ch 2 [bbbbbbbb].cbz",
        "downloads/B [8]/Source B [s2]/Ch 1 [cccccccc].cbz",
      ],
      list: async (mangaId: number, sourceId: string) => {
        listed.push(`${mangaId}/${sourceId}`);
        return [{ hash: "aaaaaaaa", paths: [], local: true }];
      },
    } as never);
    expect(listed).toEqual(["7/s1", "8/s2"]);
    expect(downloaded$.peek()["8/s2"]).toEqual({ aaaaaaaa: "local" });
  });
});
