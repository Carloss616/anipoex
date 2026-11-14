import { describe, expect, test } from "bun:test";
import type { ScanActivityArgs } from "../utils/scan-activity";
import { activeScans$, teeActivity, trackActiveScan } from "./active-scans";

const args = (mangaId: number, ...ids: string[]): ScanActivityArgs => ({
  mangaId,
  name: `Manga ${mangaId}`,
  total: ids.length,
  sources: ids.map((id) => ({
    id,
    name: id.toUpperCase(),
    initials: "XX",
    state: "pending",
  })),
});

describe("trackActiveScan", () => {
  test("adds the manga with its sources pending and drops it when the scan ends", () => {
    const scan = trackActiveScan(args(901, "source-1", "source-2"));
    expect(activeScans$["901"].peek()).toMatchObject({
      mangaId: 901,
      name: "Manga 901",
    });
    expect(activeScans$["901"].marks["source-1"].state.peek()).toBe("pending");
    scan.mark("source-1", { state: "found", unread: 2 });
    expect(activeScans$["901"].marks["source-1"].peek()).toMatchObject({
      name: "SOURCE-1",
      state: "found",
      unread: 2,
    });
    scan.end(1);
    expect(activeScans$["901"].peek()).toBeUndefined();
  });

  test("keeps a manga until its last scan ends", () => {
    const first = trackActiveScan(args(902, "source-1"));
    const second = trackActiveScan(args(902, "source-2"));
    expect(Object.keys(activeScans$["902"].marks.peek())).toEqual([
      "source-1",
      "source-2",
    ]);
    first.end(0);
    expect(activeScans$["902"].peek()).toBeDefined();
    second.end(0);
    expect(activeScans$["902"].peek()).toBeUndefined();
  });

  test("leave marks a source skipped or stopped", () => {
    const scan = trackActiveScan(args(903, "source-1", "source-2"));
    scan.leave("source-1", "skipped");
    scan.leave("source-2", "stopped");
    expect(activeScans$["903"].marks["source-1"].state.peek()).toBe("skipped");
    expect(activeScans$["903"].marks["source-2"].state.peek()).toBe("stopped");
    scan.end(0);
  });
});

describe("teeActivity", () => {
  test("passes every call to each activity", () => {
    const calls: string[] = [];
    const log = (tag: string) => ({
      progress: (d: number) => calls.push(`${tag} progress ${d}`),
      mark: (id: string) => calls.push(`${tag} mark ${id}`),
      end: (f: number) => calls.push(`${tag} end ${f}`),
    });
    const both = teeActivity(log("a"), log("b"));
    both.progress(1);
    both.mark("source-1", { state: "scanning" });
    both.end(0);
    expect(calls).toEqual([
      "a progress 1",
      "b progress 1",
      "a mark source-1",
      "b mark source-1",
      "a end 0",
      "b end 0",
    ]);
  });
});
