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

const { downloaded$ } = await import("../state/download-queue");
const { deleteDownloads } = await import("./download-actions");

afterEach(() => downloaded$.set({}));

const DIR = "downloads/Manga [314]/Source A [1234]";

function fakeStore() {
  const files = new Map([
    ["aaaaaaaa", [`${DIR}/1 [aaaaaaaa].cbz`, `${DIR}/1 [aaaaaaaa] (1).cbz`]],
    ["bbbbbbbb", [`${DIR}/2 [bbbbbbbb].cbz`]],
  ]);
  const removed: string[] = [];
  const store = {
    list: async () =>
      [...files].map(([hash, paths]) => ({ hash, paths, local: true })),
    remove: mock(async (path: string) => {
      removed.push(path);
      for (const [hash, paths] of files) {
        const left = paths.filter((p) => p !== path);
        if (left.length) files.set(hash, left);
        else files.delete(hash);
      }
    }),
  };
  return { store, removed };
}

describe("deleteDownloads", () => {
  it("removes every file of each hash, conflict copies too, and relists", async () => {
    const { store, removed } = fakeStore();
    downloaded$["314/1234"].set({ aaaaaaaa: "local", bbbbbbbb: "local" });

    await deleteDownloads(314, "1234", ["aaaaaaaa"], store as never);

    expect(removed).toEqual([
      `${DIR}/1 [aaaaaaaa].cbz`,
      `${DIR}/1 [aaaaaaaa] (1).cbz`,
    ]);
    expect(downloaded$.peek()["314/1234"]).toEqual({ bbbbbbbb: "local" });
  });

  it("relists what is left when a removal fails", async () => {
    const { store } = fakeStore();
    downloaded$["314/1234"].set({ aaaaaaaa: "local", bbbbbbbb: "local" });
    const remove = store.remove;
    let calls = 0;
    store.remove = mock(async (path: string) => {
      if (++calls === 3) throw new Error("busy");
      await remove(path);
    });

    await expect(
      deleteDownloads(314, "1234", ["aaaaaaaa", "bbbbbbbb"], store as never),
    ).rejects.toThrow("busy");
    // Both files of the first hash went before the second one failed.
    expect(downloaded$.peek()["314/1234"]).toEqual({ bbbbbbbb: "local" });
  });
});
