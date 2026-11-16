import { describe, expect, test } from "bun:test";
import { downloadLine } from "./utils";

describe("downloadLine", () => {
  test("shows the source and the state", () => {
    expect(downloadLine("Source A", "queued", undefined, false)).toBe(
      "Source A · Queued",
    );
    expect(downloadLine("Source A", "queued", undefined, true)).toBe(
      "Source A · Paused",
    );
    expect(downloadLine("Source A", "failed", "Timed out", true)).toBe(
      "Source A · Timed out",
    );
    expect(downloadLine("Source A", "failed", "", false)).toBe(
      "Source A · Failed",
    );
  });
});
