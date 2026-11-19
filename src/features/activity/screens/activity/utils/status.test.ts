import { expect, test } from "bun:test";
import { toStatusMode } from "./status";

const base = {
  online: true,
  sending: false,
  paused: false,
  queued: false,
  reading: false,
  scans: false,
};

test("offline wins over everything", () => {
  expect(
    toStatusMode({ ...base, online: false, sending: true, reading: true }),
  ).toBe("offline");
});

test("sending comes before a pause and the Reading scan", () => {
  expect(
    toStatusMode({
      ...base,
      sending: true,
      paused: true,
      queued: true,
      reading: true,
    }),
  ).toBe("sending");
});

test("a pause shows only with a queue", () => {
  expect(
    toStatusMode({ ...base, paused: true, queued: false, scans: true }),
  ).toBe("scans");
  expect(
    toStatusMode({ ...base, paused: true, queued: true, reading: true }),
  ).toBe("paused");
});

test("nothing to tell is empty", () => expect(toStatusMode(base)).toBe(""));
