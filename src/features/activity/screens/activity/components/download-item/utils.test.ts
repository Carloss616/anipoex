import { describe, expect, test } from "bun:test";
import { downloadLine, downloadTitle } from "./utils";

describe("downloadTitle", () => {
  test("names the chapter by number, else by name, else Chapter", () => {
    expect(downloadTitle("Manga", { number: 12, name: "Ep" })).toBe(
      "Manga · Chapter 12",
    );
    expect(downloadTitle("Manga", { number: -1, name: "Extra" })).toBe(
      "Manga · Extra",
    );
    expect(downloadTitle("Manga", { number: -1, name: "" })).toBe(
      "Manga · Chapter",
    );
  });
});

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
