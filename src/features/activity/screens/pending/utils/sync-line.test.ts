import { describe, expect, test } from "bun:test";
import { syncLine } from "./sync-line";

const base = { syncing: false, online: true, synced: true, unsynced: "" };

describe("syncLine", () => {
  test("a running sync wins", () => {
    expect(syncLine({ ...base, syncing: true, unsynced: "1 pin" })).toBe(
      "Syncing…",
    );
  });

  test("a target that never synced", () => {
    expect(syncLine({ ...base, synced: false })).toBe("Not synced yet");
  });

  test("nothing changed since the last sync", () => {
    expect(syncLine(base)).toBe("Up to date");
  });

  test("changes wait for the connection only while offline", () => {
    const changed = { ...base, unsynced: "2 pins" };
    expect(syncLine({ ...changed, online: false })).toBe(
      "Waiting for connection",
    );
    expect(syncLine(changed)).toBe("");
  });
});
