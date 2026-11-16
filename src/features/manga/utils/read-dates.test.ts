import { describe, expect, it } from "bun:test";
import type { MangaReadDatesQuery } from "../graphql/manga-read-dates.generated";
import { readDates } from "./read-dates";

type Act = { status: string; progress?: string; at: Date };

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m, d, h);

const page = (acts: Act[]) => ({
  __typename: "Page" as const,
  activities: acts.map((a, id) => ({
    __typename: "ListActivity" as const,
    id,
    createdAt: Math.floor(a.at.getTime() / 1000),
    status: a.status,
    progress: a.progress ?? null,
  })),
});

/** Activities oldest first, as they happened. */
const data = (acts: Act[]): MangaReadDatesQuery => ({
  latest: page([...acts].reverse()),
  earliest: page(acts),
});

describe("readDates", () => {
  it("finishes on the day of the newest chapter read", () => {
    const result = readDates(
      data([
        { status: "plans to read", at: at(2024, 0, 1) },
        { status: "read chapter", progress: "1 - 3", at: at(2024, 0, 5) },
        {
          status: "read chapter",
          progress: "118 - 120",
          at: at(2025, 4, 4, 23),
        },
        { status: "paused reading", at: at(2025, 6, 1) },
      ]),
    );

    // Calendar days, as the pickers hold them, not the activity's time.
    expect(result).toEqual({
      startedAt: new Date(2024, 0, 5),
      completedAt: new Date(2025, 4, 4),
    });
  });

  it("gives no start when the first read was past chapter 1", () => {
    const result = readDates(
      data([
        { status: "read chapter", progress: "92", at: at(2022, 1, 25) },
        { status: "read chapter", progress: "120", at: at(2025, 4, 4) },
      ]),
    );

    expect(result.startedAt).toBeUndefined();
    expect(result.completedAt).toEqual(new Date(2025, 4, 4));
  });

  it("ignores reads that belong to an earlier Completed", () => {
    const result = readDates(
      data([
        { status: "read chapter", progress: "1", at: at(2022, 0, 1) },
        { status: "read chapter", progress: "50", at: at(2022, 5, 1) },
        { status: "completed", at: at(2022, 5, 1) },
      ]),
    );

    expect(result).toEqual({ completedAt: undefined });
  });

  it("gives a reread its finish but no start", () => {
    const result = readDates(
      data([
        { status: "read chapter", progress: "1", at: at(2022, 0, 1) },
        { status: "completed", at: at(2022, 5, 1) },
        { status: "reread chapter", progress: "1 - 50", at: at(2024, 2, 3) },
      ]),
    );

    expect(result).toEqual({ completedAt: new Date(2024, 2, 3) });
  });

  it("gives no start when the entry says it is a reread", () => {
    // The earlier Completed sits past the newest page, out of sight.
    const result = readDates(
      data([
        { status: "read chapter", progress: "1", at: at(2024, 0, 1) },
        { status: "read chapter", progress: "40", at: at(2024, 2, 3) },
      ]),
      true,
    );

    expect(result).toEqual({ completedAt: new Date(2024, 2, 3) });
  });

  it("knows nothing without activity", () => {
    expect(readDates(undefined)).toEqual({});
    expect(readDates(data([]))).toEqual({});
  });
});
