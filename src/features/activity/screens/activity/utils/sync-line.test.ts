import { describe, expect, test } from "bun:test";
import { syncLine } from "./sync-line";

const base = { syncing: false, online: true, synced: true };

describe("syncLine", () => {
  test("a running sync wins", () => {
    expect(syncLine({ ...base, syncing: true })).toBe("Syncing…");
  });

  test("a target that never synced", () => {
    expect(syncLine({ ...base, synced: false })).toBe("Not synced yet");
  });

  test("changes wait for the connection only while offline", () => {
    expect(syncLine({ ...base, online: false })).toBe("Waiting for connection");
    expect(syncLine(base)).toBe("");
  });

  test("counts down to a sync set to run, unless it can't reach", () => {
    expect(syncLine({ ...base, inSeconds: 42 })).toBe("Syncs in 42s");
    expect(syncLine({ ...base, inSeconds: 42, online: false })).toBe(
      "Waiting for connection",
    );
  });
});
