import { describe, expect, test } from "bun:test";
import type { HomeActivityFragment } from "@/features/home/graphql/home-sections.generated";
import { activityAction, timeAgo } from "./utils";

const activity = (status: string, progress: string | null) =>
  ({ status, progress }) as HomeActivityFragment;

describe("activityAction", () => {
  test("names the chapters before the title", () => {
    expect(activityAction(activity("read chapter", "10 - 12"))).toBe(
      "read chapter 10 - 12 of",
    );
  });

  test("a status with no progress stands alone", () => {
    expect(activityAction(activity("plans to read", null))).toBe(
      "plans to read",
    );
  });
});

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
