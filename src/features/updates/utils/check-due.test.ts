import { expect, test } from "bun:test";
import { CHECK_EVERY_MS } from "../constants";
import { isCheckDue } from "./check-due";

const now = 10 * CHECK_EVERY_MS;

test("checks on a device that never looked", () => {
  expect(isCheckDue({}, now)).toBe(true);
});

test("waits a day after the last check", () => {
  expect(isCheckDue({ updateCheckedAt: now - CHECK_EVERY_MS + 1 }, now)).toBe(
    false,
  );
  expect(isCheckDue({ updateCheckedAt: now - CHECK_EVERY_MS }, now)).toBe(true);
});

test("never checks when turned off", () => {
  expect(isCheckDue({ updateCheck: false }, now)).toBe(false);
});
