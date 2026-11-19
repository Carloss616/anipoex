import { describe, expect, test } from "bun:test";
import type { HistoryActivityFragment } from "@/features/manga/graphql/manga-history.generated";
import { dayLabel, historyRows } from "./history-rows";

const now = new Date(2026, 10, 18, 15, 0);
const at = (day: number, hour: number) =>
  new Date(2026, 10, day, hour).getTime() / 1000;
const activity = (id: number, createdAt: number) =>
  ({ id, createdAt, status: "read chapter" }) as HistoryActivityFragment;

const shape = (rows: ReturnType<typeof historyRows>) =>
  rows.map((r) =>
    r.type === "day"
      ? r.label
      : `${r.key}${r.first ? "^" : ""}${r.last ? "$" : ""}`,
  );

describe("historyRows", () => {
  test("one day row per local day, with each day's first and last", () => {
    const rows = historyRows(
      [
        activity(5, at(18, 14)),
        activity(4, at(18, 9)),
        activity(3, at(17, 23)),
        activity(2, at(14, 22)),
        activity(1, at(14, 10)),
      ],
      now,
    );
    expect(shape(rows)).toEqual([
      "Today",
      "5^",
      "4$",
      "Yesterday",
      "3^$",
      "Saturday, Nov 14",
      "2^",
      "1$",
    ]);
  });

  test("a new page keeps the rows already shown as the same objects", () => {
    const a = activity(3, at(18, 14));
    const b = activity(2, at(17, 9));
    const first = historyRows([a, b], now);
    const next = historyRows([a, b, activity(1, at(17, 8))], now, first);
    expect(next[0]).toBe(first[0]);
    expect(next[1]).toBe(first[1]);
    expect(next[2]).toBe(first[2]);
    // `b` is no longer the last of its day.
    expect(next[3]).not.toBe(first[3]);
  });
});

describe("dayLabel", () => {
  test("another year shows the year", () => {
    expect(dayLabel(new Date(2025, 2, 2), now)).toBe("Mar 2, 2025");
  });
});
