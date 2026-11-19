import { describe, expect, it } from "bun:test";
import {
  changedKeys,
  leaves,
  localRecords,
  mergeRecords,
  PURGE_AFTER_MS,
  purge,
  type Records,
  valueAt,
} from "./records";

const exclusions = {
  21: { "source-1": { reason: "outdated" }, "source-2": { reason: "other" } },
  88: { "source-1": { reason: "not-matched" } },
};

describe("leaves", () => {
  it("names each record by its path", () => {
    expect(leaves(exclusions, 2).map(([key]) => key)).toEqual([
      "21/source-1",
      "21/source-2",
      "88/source-1",
    ]);
  });

  it("takes a whole table as one record at depth 0", () => {
    expect(leaves(["a", "b"], 0)).toEqual([["", ["a", "b"]]]);
  });

  it("finds a record back by its key", () => {
    expect(valueAt(exclusions, "88/source-1")).toEqual({
      reason: "not-matched",
    });
    expect(valueAt(exclusions, "88/source-9")).toBeUndefined();
  });
});

describe("changedKeys", () => {
  it("lists the records a set above them added, changed or removed", () => {
    const next = {
      21: { "source-1": { reason: "outdated" }, "source-3": { reason: "x" } },
      88: { "source-1": { reason: "other" } },
    };

    expect(changedKeys(exclusions, next, 2).sort()).toEqual([
      "21/source-2",
      "21/source-3",
      "88/source-1",
    ]);
  });

  it("continues the path of the change it starts from", () => {
    expect(
      changedKeys(exclusions[21], { "source-1": { reason: "outdated" } }, 1, [
        "21",
      ]),
    ).toEqual(["21/source-2"]);
  });
});

describe("localRecords", () => {
  it("stamps each record, 0 when it was never stamped", () => {
    const records = localRecords(exclusions, 2, {
      "21/source-1": { updatedAt: 5 },
    });

    expect(records["21/source-1"]).toEqual({
      value: { reason: "outdated" },
      updatedAt: 5,
    });
    expect(records["88/source-1"]?.updatedAt).toBe(0);
  });

  it("keeps a removal as a tombstone", () => {
    const records = localRecords({}, 1, {
      21: { updatedAt: 9, deletedAt: 9 },
    });

    expect(records).toEqual({ 21: { updatedAt: 9, deletedAt: 9 } });
  });

  it("leaves out what stays on the device", () => {
    const records = localRecords(
      { theme: { family: "ink" }, device: { id: "x" } },
      1,
      {},
      (key) => key !== "device",
    );

    expect(Object.keys(records)).toEqual(["theme"]);
  });
});

describe("mergeRecords", () => {
  const local: Records = {
    a: { value: "local", updatedAt: 10 },
    b: { value: "local", updatedAt: 0 },
    c: { value: "local", updatedAt: 30 },
  };

  it("keeps the newest of each record and adds what one side lacks", () => {
    const merged = mergeRecords(local, [
      {
        device: "phone",
        records: {
          a: { value: "phone", updatedAt: 20 },
          c: { value: "phone", updatedAt: 25 },
          d: { value: "phone", updatedAt: 1 },
        },
      },
    ]);

    expect(merged.a?.value).toBe("phone");
    expect(merged.c?.value).toBe("local");
    expect(merged.d?.value).toBe("phone");
  });

  it("gives a tie to the target, so a device that joins adopts it", () => {
    const merged = mergeRecords(local, [
      { device: "phone", records: { b: { value: "phone", updatedAt: 0 } } },
    ]);

    expect(merged.b?.value).toBe("phone");
  });

  it("settles a tie between two devices the same way in any order", () => {
    const files = [
      { device: "mac", records: { b: { value: "mac", updatedAt: 7 } } },
      { device: "phone", records: { b: { value: "phone", updatedAt: 7 } } },
    ];

    expect(mergeRecords({}, files).b?.value).toBe("mac");
    expect(mergeRecords({}, [...files].reverse()).b?.value).toBe("mac");
  });

  it("lets a later removal beat an edit and a later edit beat a removal", () => {
    const merged = mergeRecords(local, [
      {
        device: "phone",
        records: {
          a: { updatedAt: 15, deletedAt: 15 },
          c: { updatedAt: 20, deletedAt: 20 },
        },
      },
    ]);

    expect(merged.a).toEqual({ updatedAt: 15, deletedAt: 15 });
    expect(merged.c?.value).toBe("local");
  });
});

describe("purge", () => {
  it("drops only tombstones older than the purge window", () => {
    const now = PURGE_AFTER_MS + 1000;
    const records = purge(
      {
        old: { updatedAt: 1, deletedAt: 1 },
        recent: { updatedAt: now - 10, deletedAt: now - 10 },
        live: { value: 1, updatedAt: 1 },
      },
      now,
    );

    expect(Object.keys(records).sort()).toEqual(["live", "recent"]);
  });

  it("honors a shorter window", () => {
    const day = 24 * 60 * 60 * 1000;
    const now = 20 * day;
    const records = { gone: { updatedAt: 0, deletedAt: now - 15 * day } };

    expect(purge(records, now, 14 * day)).toEqual({});
    expect(Object.keys(purge(records, now))).toEqual(["gone"]);
  });

  it("keeps live records with any window", () => {
    expect(purge({ live: { value: 1, updatedAt: 0 } }, 1e9, 1)).toEqual({
      live: { value: 1, updatedAt: 0 },
    });
  });
});
