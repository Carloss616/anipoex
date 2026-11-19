import type { HistoryActivityFragment } from "@/features/manga/graphql/manga-history.generated";

export type HistoryRow =
  | { type: "day"; key: string; label: string }
  | {
      type: "activity";
      key: string;
      activity: HistoryActivityFragment;
      /** First and last of its day, for the corners of the day's group. */
      first: boolean;
      last: boolean;
    };

const WEEKDAY: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "short",
  day: "numeric",
};
const FULL: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/** "Today", "Yesterday", "Saturday, Nov 14", or "Mar 2, 2025" in another year. */
export function dayLabel(date: Date, now: Date) {
  if (dayKey(date) === dayKey(now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday";
  return date.toLocaleDateString(
    "en-US",
    date.getFullYear() === now.getFullYear() ? WEEKDAY : FULL,
  );
}

/**
 * A day row before each local day's activities, newest first. Rows equal to
 * one of `previous` come back as that same object, so a new page doesn't
 * re-render the rows already shown.
 */
export function historyRows(
  activities: HistoryActivityFragment[],
  now: Date,
  previous: HistoryRow[] = [],
): HistoryRow[] {
  const rows: HistoryRow[] = [];
  let day = "";
  for (const [i, activity] of activities.entries()) {
    const date = new Date(activity.createdAt * 1000);
    const key = dayKey(date);
    const first = key !== day;
    if (first) {
      day = key;
      rows.push({ type: "day", key: `day-${key}`, label: dayLabel(date, now) });
    }
    const next = activities[i + 1];
    const last = !next || dayKey(new Date(next.createdAt * 1000)) !== key;
    rows.push({
      type: "activity",
      key: String(activity.id),
      activity,
      first,
      last,
    });
  }

  const byKey = new Map(previous.map((row) => [row.key, row]));
  return rows.map((row) => {
    const old = byKey.get(row.key);
    if (!old || old.type !== row.type) return row;
    if (row.type === "day")
      return old.type === "day" && old.label === row.label ? old : row;
    return old.type === "activity" &&
      old.activity === row.activity &&
      old.first === row.first &&
      old.last === row.last
      ? old
      : row;
  });
}
