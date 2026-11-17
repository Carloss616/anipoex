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
const { downloadedPairs, refreshDownloaded, seedDownloaded } = await import(
  "./downloaded"
);

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

describe("downloadedPairs", () => {
  it("reads each manga and source id once", () => {
    const paths = [
      "downloads/Title [8]/Source A [s1]/Chapter 1 [aaaaaaaa].cbz",
      "downloads/Title [8]/Source A [s1]/Chapter 2 [bbbbbbbb].cbz",
      "downloads/Title [8]/Source B [s2]/Chapter 1 [cccccccc].cbz",
      "downloads/Other [9]/Source A [s1]/Chapter 1 [dddddddd].cbz",
    ];
    expect(downloadedPairs(paths)).toEqual([
      [8, "s1"],
      [8, "s2"],
      [9, "s1"],
    ]);
  });
});

describe("seedDownloaded", () => {
  it("lists the manga it doesn't hold, once per launch", async () => {
    downloaded$["830/s"].set({ eeeeeeee: "cloud" });
    const listed: string[] = [];
    let listAlls = 0;
    const store = {
      async listAll() {
        listAlls++;
        return [
          "downloads/A [830]/S [s]/C [ffffffff].cbz",
          "downloads/B [831]/S [s]/C [aaaaaaaa].cbz",
        ];
      },
      async list(mangaId: number, sourceId: string) {
        listed.push(`${mangaId}/${sourceId}`);
        return [{ hash: "aaaaaaaa", local: true, paths: [] }];
      },
    } as never;
    await seedDownloaded(store);
    await seedDownloaded(store);
    expect(listAlls).toBe(1);
    expect(listed).toEqual(["831/s"]);
    expect(downloaded$.peek()["831/s"]).toEqual({ aaaaaaaa: "local" });
    expect(downloaded$.peek()["830/s"]).toEqual({ eeeeeeee: "cloud" });
  });
});
