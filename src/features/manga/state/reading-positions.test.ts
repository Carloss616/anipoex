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

const { dropPosition, readingPositions$, restorePosition, savePosition } =
  await import("./reading-positions");

const at = (chapterId: string, page = 3, offset = 0.25) => ({
  sourceId: "source-1",
  chapterId,
  number: Number(chapterId.slice(4)),
  scanlator: null,
  page,
  pages: 20,
  offset,
});

describe("reading positions", () => {
  it("keeps one record per manga", () => {
    savePosition(1, at("/ch-10"));
    savePosition(1, at("/ch-11"));
    expect(Object.keys(readingPositions$.peek())).toEqual(["1"]);
    expect(readingPositions$[1].chapterId.peek()).toBe("/ch-11");
  });

  it("skips an unchanged position", () => {
    savePosition(2, at("/ch-10"));
    const first = readingPositions$[2].peek();
    savePosition(2, at("/ch-10"));
    expect(readingPositions$[2].peek()).toBe(first);
  });

  it("drops only its chapter", () => {
    savePosition(3, at("/ch-10"));
    expect(dropPosition(3, "/ch-11")).toBeUndefined();
    expect(readingPositions$[3].peek()).toBeDefined();
    const dropped = dropPosition(3, "/ch-10");
    expect(dropped?.chapterId).toBe("/ch-10");
    expect("3" in readingPositions$.peek()).toBe(false);
  });

  it("puts a dropped position back", () => {
    savePosition(4, at("/ch-10", 7, 0.5));
    const dropped = dropPosition(4);
    if (!dropped) throw new Error("nothing dropped");
    restorePosition(4, dropped);
    expect(readingPositions$[4].peek()).toEqual(dropped);
  });
});
