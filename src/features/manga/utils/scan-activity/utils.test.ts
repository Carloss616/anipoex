import { afterEach, describe, expect, it, setSystemTime } from "bun:test";
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
  const start = () => ({ scans: [] });
  const scan = (): Scan => ({
    done: 0,
    total: 1,
    found: null,
    source: "Source A",
  });

  afterEach(() => setSystemTime());

  it("joins the manga's running group, else starts a new one", () => {
    const groups = new Map<number, { scans: Scan[] }>();
    const a = scan();
    const first = joinGroup(groups, 1, a, start);
    expect(first.running).toBe(false);
    expect(joinGroup(groups, 1, scan(), start)).toEqual({
      group: first.group,
      running: true,
    });
    expect(joinGroup(groups, 2, scan(), start).group).not.toBe(first.group);

    trackScan(a, () => {}).end(1);
    expect(a).toMatchObject({ done: 1, found: 1 });
  });

  it("takes scans for a while after it ends", () => {
    const groups = new Map<number, { scans: Scan[] }>();
    setSystemTime(new Date(0));
    const first = joinGroup(groups, 1, scan(), start);
    trackScan(first.group.scans[0], () => {}).end(1);

    setSystemTime(new Date(60_000));
    const second = joinGroup(groups, 1, scan(), start);
    expect(second).toEqual({ group: first.group, running: false });
    for (const s of first.group.scans) trackScan(s, () => {}).end(0);

    setSystemTime(new Date(60_000 + 2 * 60_000));
    const third = joinGroup(groups, 1, scan(), start);
    expect(third.group).not.toBe(first.group);
    expect(third.group.scans).toHaveLength(1);
  });
});
