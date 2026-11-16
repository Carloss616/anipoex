import { describe, expect, it } from "bun:test";
import type { DownloadStore } from "./download-store/download-store";
import { isMoving, moveDownloads, moveOnce, sameRoot } from "./move-downloads";

const A = "downloads/Title [1]/Source A [10]/Ch 1 [aaaaaaaa].cbz";
const B = "downloads/Title [1]/Source A [10]/Ch 2 [bbbbbbbb].cbz";
const C = "downloads/Title [1]/Source A [10]/Ch 3 [cccccccc].cbz";

/** An in-memory store: path → contents; `get` hands back `uri:<path>`. */
function fakeStore(
  files: Record<string, string>,
  fail: Partial<Record<"get" | "put" | "remove", string>> = {},
) {
  const calls: string[] = [];
  const check = (method: "get" | "put" | "remove", path: string) => {
    calls.push(`${method} ${path}`);
    if (fail[method] === path) throw new Error(`${method} failed`);
  };
  const store: DownloadStore = {
    list: async () => [],
    listAll: async () => Object.keys(files),
    async get(path) {
      check("get", path);
      return `uri:${path}`;
    },
    async put(path, fileUri) {
      check("put", path);
      files[path] = fileUri;
    },
    async remove(path) {
      check("remove", path);
      delete files[path];
    },
  };
  return { store, files, calls };
}

describe("moveDownloads", () => {
  it("moves each path: get, put, then remove", async () => {
    const from = fakeStore({ [A]: "a", [B]: "b" });
    const to = fakeStore({});
    const result = await moveDownloads(from.store, to.store, () => {});
    expect(result).toEqual({ moved: 2, skipped: 0, failed: 0 });
    expect(Object.keys(from.files)).toEqual([]);
    expect(to.files).toEqual({ [A]: `uri:${A}`, [B]: `uri:${B}` });
    expect(from.calls).toEqual([
      `get ${A}`,
      `remove ${A}`,
      `get ${B}`,
      `remove ${B}`,
    ]);
  });

  it("skips a path the target already has and keeps the source", async () => {
    const from = fakeStore({ [A]: "a", [B]: "b" });
    const to = fakeStore({ [A]: "there" });
    const result = await moveDownloads(from.store, to.store, () => {});
    expect(result).toEqual({ moved: 1, skipped: 1, failed: 0 });
    expect(Object.keys(from.files)).toEqual([A]);
    expect(to.files[A]).toBe("there");
    expect(to.calls).toEqual([`put ${B}`]);
  });

  it("removes nothing when both stores are the same folder", async () => {
    const same = fakeStore({ [A]: "a", [B]: "b" });
    const result = await moveDownloads(same.store, same.store, () => {});
    expect(result).toEqual({ moved: 0, skipped: 2, failed: 0 });
    expect(same.files).toEqual({ [A]: "a", [B]: "b" });
    expect(same.calls).toEqual([]);
  });

  it("keeps the source of a failed path and goes on", async () => {
    const from = fakeStore({ [A]: "a", [B]: "b", [C]: "c" }, { get: A });
    const to = fakeStore({}, { put: B });
    const result = await moveDownloads(from.store, to.store, () => {});
    expect(result).toEqual({ moved: 1, skipped: 0, failed: 2 });
    expect(Object.keys(from.files)).toEqual([A, B]);
    expect(Object.keys(to.files)).toEqual([C]);
  });

  it("counts a failed remove as failed, the file still in the source", async () => {
    const from = fakeStore({ [A]: "a" }, { remove: A });
    const to = fakeStore({});
    expect(await moveDownloads(from.store, to.store, () => {})).toEqual({
      moved: 0,
      skipped: 0,
      failed: 1,
    });
    expect(Object.keys(from.files)).toEqual([A]);
  });

  it("reports progress 1..n", async () => {
    const from = fakeStore({ [A]: "a", [B]: "b", [C]: "c" }, { get: B });
    const to = fakeStore({ [C]: "c" });
    const progress: [number, number][] = [];
    await moveDownloads(from.store, to.store, (done, total) =>
      progress.push([done, total]),
    );
    expect(progress).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
  });
});

describe("moveOnce", () => {
  it("runs one move at a time", async () => {
    let release: () => void = () => {};
    const slow = fakeStore({ [A]: "a" });
    const listAll = slow.store.listAll;
    slow.store.listAll = async () => {
      await new Promise<void>((done) => (release = done));
      return listAll();
    };
    const to = fakeStore({});
    const first = moveOnce(slow.store, to.store, () => {});
    expect(isMoving()).toBe(true);
    const other = fakeStore({ [B]: "b" });
    expect(await moveOnce(other.store, to.store, () => {})).toBeUndefined();
    expect(other.calls).toEqual([]);
    release();
    expect(await first).toEqual({ moved: 1, skipped: 0, failed: 0 });
    expect(isMoving()).toBe(false);
    expect(await moveOnce(other.store, to.store, () => {})).toEqual({
      moved: 1,
      skipped: 0,
      failed: 0,
    });
  });

  it("frees the flag when the move throws", async () => {
    const broken = fakeStore({});
    broken.store.listAll = async () => {
      throw new Error("boom");
    };
    await expect(
      moveOnce(broken.store, fakeStore({}).store, () => {}),
    ).rejects.toThrow("boom");
    expect(isMoving()).toBe(false);
  });
});

describe("sameRoot", () => {
  it("compares kind and location", () => {
    expect(sameRoot({ kind: "device" }, { kind: "device" })).toBe(true);
    expect(
      sameRoot(
        { kind: "folder", location: "/f" },
        { kind: "folder", location: "/f" },
      ),
    ).toBe(true);
    expect(
      sameRoot(
        { kind: "folder", location: "/f" },
        { kind: "folder", location: "/g" },
      ),
    ).toBe(false);
    expect(
      sameRoot({ kind: "folder", location: "/f" }, { kind: "device" }),
    ).toBe(false);
  });
});
