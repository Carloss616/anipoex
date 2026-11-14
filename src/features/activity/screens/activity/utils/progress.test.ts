import { describe, expect, test } from "bun:test";
import type { ActiveMark } from "@/features/manga/state/active-scans";
import { scanProgress, sourceStatus } from "./progress";

const mark = (state: ActiveMark["state"], unread?: number) =>
  ({
    id: state,
    name: "Source A",
    initials: "SA",
    state,
    unread,
  }) as ActiveMark;

describe("scanProgress", () => {
  test("counts the sources done and found", () => {
    const marks = [
      mark("found", 2),
      mark("nomatch"),
      mark("scanning"),
      mark("pending"),
      mark("skipped"),
    ];
    expect(scanProgress(marks)).toEqual({
      value: 3 / 5,
      line: "3/5 sources · 1 found",
    });
    expect(scanProgress([mark("pending")]).line).toBe("0/1 sources");
  });
});

describe("sourceStatus", () => {
  test("names each state", () => {
    expect(sourceStatus(mark("found", 3))).toEqual({
      label: "+3",
      tone: "success",
    });
    expect(sourceStatus(mark("found")).label).toBe("Found");
    expect(sourceStatus(mark("skipped"))).toEqual({
      label: "Slow · skipped",
      tone: "warning",
    });
    expect(sourceStatus(mark("error")).tone).toBe("destructive");
    expect(sourceStatus(mark("pending")).label).toBe("Waiting");
  });
});
