import { describe, expect, test } from "bun:test";
import { type ActivityState, labelFor } from "./label-for";

const idle: ActivityState = {
  online: true,
  waiting: 0,
  paused: false,
  downloadsLeft: 0,
  scans: 0,
};
const label = (s: Partial<ActivityState>) => labelFor({ ...idle, ...s });

describe("labelFor", () => {
  test("is empty when idle", () => expect(label({})).toBe(""));

  test("Offline beats everything", () =>
    expect(label({ online: false, waiting: 2, scans: 1 })).toBe("Offline"));

  test("Sending beats a pause and the scans", () =>
    expect(
      label({ waiting: 2, paused: true, downloadsLeft: 1, scans: 1 }),
    ).toBe("Sending 2"));

  test("Paused needs a queue", () => {
    expect(label({ paused: true })).toBe("");
    expect(label({ paused: true, downloadsLeft: 3, scans: 1 })).toBe("Paused");
  });

  test("scans come before downloads", () => {
    expect(label({ scans: 2, downloadsLeft: 3 })).toBe("2 running");
    expect(label({ downloadsLeft: 3 })).toBe("3 downloading");
  });
});
