import { describe, expect, it } from "bun:test";
import {
  parseSyncFile,
  SYNC_FORMAT,
  serializeSyncFile,
  syncFileName,
} from "./sync-file";

const file = {
  format: SYNC_FORMAT,
  device: "mac-1a2b",
  table: "exclusions",
  records: {
    "21/source-1": { value: { reason: "outdated" }, updatedAt: 10 },
    "88/source-2": { updatedAt: 20, deletedAt: 20 },
  },
};

describe("sync files", () => {
  it("names a file flat, since a gist holds no folders", () => {
    expect(syncFileName("exclusions", "mac-1a2b")).toBe(
      "anipoex-exclusions.mac-1a2b.json",
    );
  });

  it("reads back what it wrote", () => {
    expect(parseSyncFile(serializeSyncFile(file), "exclusions")).toEqual(file);
  });

  it("refuses broken text, another table and a newer format", () => {
    expect(parseSyncFile("{", "exclusions")).toBeUndefined();
    expect(parseSyncFile(serializeSyncFile(file), "pins")).toBeUndefined();
    expect(
      parseSyncFile(
        serializeSyncFile({ ...file, format: SYNC_FORMAT + 1 }),
        "exclusions",
      ),
    ).toBeUndefined();
  });

  it("drops a record edited into a bad shape and keeps the rest", () => {
    const text = JSON.stringify({
      ...file,
      records: {
        ...file.records,
        broken: { value: 1 },
        odd: "x",
        valueless: { updatedAt: 99 },
      },
    });

    expect(
      Object.keys(parseSyncFile(text, "exclusions")?.records ?? {}),
    ).toEqual(["21/source-1", "88/source-2"]);
  });
});
