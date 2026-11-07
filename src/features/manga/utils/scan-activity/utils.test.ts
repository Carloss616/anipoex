import { describe, expect, it } from "bun:test";
import {
  groupStatus,
  joinGroup,
  type Scan,
  scanStatus,
  trackScan,
} from "./utils";

describe("scanStatus", () => {
  it("counts a Scan all", () => {
    expect(scanStatus({ done: 2, total: 5, found: null })).toBe(
      "Scanning 2 of 5 sources",
    );
    expect(scanStatus({ done: 5, total: 5, found: 3 })).toBe(
      "Found on 3 of 5 sources",
    );
  });

  it("names a rescan's source", () => {
    const rescan = { done: 0, total: 1, source: "Source A" };
    expect(scanStatus({ ...rescan, found: null })).toBe("Scanning Source A");
    expect(scanStatus({ ...rescan, found: 1 })).toBe("Found on Source A");
    expect(scanStatus({ ...rescan, found: 0 })).toBe("Not found on Source A");
  });
});

describe("groupStatus", () => {
  const rescan = (source: string, found: number | null) => ({
    done: 0,
    total: 1,
    found,
    source,
  });

  it("matches scanStatus for a single scan", () => {
    expect(groupStatus([rescan("Source A", null)])).toBe("Scanning Source A");
  });

  it("shows only the running scans while any runs", () => {
    expect(
      groupStatus([
        rescan("Source A", 1),
        rescan("Source B", null),
        rescan("Source C", null),
        { done: 2, total: 5, found: null },
      ]),
    ).toBe("Scanning 2 of 5 sources · Scanning Source B, Source C");
  });

  it("sums up every result once all end", () => {
    expect(
      groupStatus([
        rescan("Source A", 1),
        rescan("Source B", 0),
        rescan("Source C", 1),
        { done: 5, total: 5, found: 3 },
      ]),
    ).toBe(
      "Found on 3 of 5 sources · Found on Source A, Source C · Not found on Source B",
    );
  });
});

describe("joinGroup", () => {
  it("joins the manga's running group, else starts a new one", () => {
    const groups = new Map<number, { scans: Scan[] }>();
    const start = () => ({ scans: [] });
    const scan = (): Scan => ({
      done: 0,
      total: 1,
      found: null,
      source: "Source A",
    });
    const a = scan();
    const first = joinGroup(groups, 1, a, start);
    const second = joinGroup(groups, 1, scan(), start);
    expect(first.joined).toBe(false);
    expect(second).toEqual({ group: first.group, joined: true });
    expect(joinGroup(groups, 2, scan(), start).joined).toBe(false);

    for (const s of first.group.scans) trackScan(s, () => {}).end(1);
    expect(a).toEqual({ done: 1, total: 1, found: 1, source: "Source A" });
    const third = joinGroup(groups, 1, scan(), start);
    expect(third.joined).toBe(false);
    expect(third.group.scans).toHaveLength(1);
  });
});
