import { describe, expect, it, mock } from "bun:test";
import type { StoredChapters } from "../utils/chapter-storage";

const stored: Record<number, StoredChapters> = {
  1: { sourceId: "a", url: "/1", chapters: [] },
};
const writes: [number, unknown][] = [];

mock.module("../utils/chapter-storage", () => ({
  // Async like IndexedDB, so a read has to wait for storage.
  readStoredChapters: async (mangaId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (mangaId === 3) throw new Error("blocked");
    return stored[mangaId];
  },
  writeStoredChapters: (mangaId: number, value: unknown) => {
    writes.push([mangaId, value]);
  },
}));

const { chapters$, readChapters } = await import("./chapters");

describe("chapters$", () => {
  it("reads one manga's entry once storage answers", async () => {
    expect(await readChapters(1)).toEqual(stored[1]);
    expect(await readChapters(2)).toBeUndefined();
  });

  it("reads nothing when storage fails", async () => {
    expect(await readChapters(3)).toBeUndefined();
  });

  it("writes only the manga that changed", async () => {
    const value = { sourceId: "b", url: "/2", chapters: [] };
    await readChapters(2);
    chapters$[2].set(value);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(writes).toEqual([[2, value]]);
    expect(await readChapters(2)).toEqual(value);
  });
});
