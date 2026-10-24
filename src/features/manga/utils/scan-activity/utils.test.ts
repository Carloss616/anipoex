import { describe, expect, it } from "bun:test";
import { scanStatus } from "./utils";

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
