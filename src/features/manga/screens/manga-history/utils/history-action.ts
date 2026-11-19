import type { HistoryActivityFragment } from "@/features/manga/graphql/manga-history.generated";
import type { PendingEntry } from "@/features/manga/state/pending-entries";

/** What an activity did, for the badge on its cover. */
export type HistoryKind = "read" | "add" | "done" | "pause" | "drop";

/** The activity's kind, from AniList's status text. */
export function historyKind(status: string | null): HistoryKind {
  if (status?.startsWith("plans")) return "add";
  if (status === "completed") return "done";
  if (status?.startsWith("paused")) return "pause";
  if (status === "dropped") return "drop";
  return "read";
}

/** The activity as a sentence: "Read chapters 118 – 120", "Plans to read". */
export function historyAction({
  status,
  progress,
}: Pick<HistoryActivityFragment, "status" | "progress">) {
  const text = status ? status[0].toUpperCase() + status.slice(1) : "Updated";
  if (!progress) return text;
  // AniList merges close updates into one range, "118 - 120".
  const range = progress.includes("-");
  const shown = progress.replace(/\s*-\s*/, " – ");
  if (text.endsWith(" chapter")) return `${text}${range ? "s" : ""} ${shown}`;
  return `${text} at ${shown}`;
}

// shortcut: the device locale is read once per run, reload JS if it changes.
const TIME = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/** The activity's local time of day: "14:32", "2:32 PM". */
export const activityTime = (createdAt: number) =>
  TIME.format(new Date(createdAt * 1000));

/** What a change kept offline will tell AniList. */
export function pendingAction({
  remove,
  progress,
  edits,
  entryId,
}: PendingEntry) {
  if (remove) return "Remove from your list";
  if (entryId == null) return "Add to your list";
  if (progress != null) return `Read chapter ${progress}`;
  if (edits?.progress != null) return `Progress ${edits.progress}`;
  return "Edit entry";
}
