import { describe, expect, test } from "bun:test";
import type { HomeActivityFragment } from "@/features/home/graphql/home-sections.generated";
import { activityAction } from "./utils";

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
