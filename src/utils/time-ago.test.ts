import { describe, expect, test } from "bun:test";
import { timeAgo } from "./time-ago";

describe("timeAgo", () => {
  const now = 1_000_000_000_000;
  const at = (secondsAgo: number) => now / 1000 - secondsAgo;

  test("under a minute is just now", () => {
    expect(timeAgo(at(30), now)).toBe("just now");
  });

  test("minutes, hours, then days", () => {
    expect(timeAgo(at(5 * 60), now)).toBe("5m ago");
    expect(timeAgo(at(3 * 3600), now)).toBe("3h ago");
    expect(timeAgo(at(2 * 86400 + 10), now)).toBe("2d ago");
  });
});
