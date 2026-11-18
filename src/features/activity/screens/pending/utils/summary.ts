import { MANGA_STATUSES } from "@/features/manga/constants";
import type { PendingEntry } from "@/features/manga/state/pending-entries";

/**
 * What AniList had, for a change queued by hand: the cache already holds the
 * queued edit, so the record's `before` is the only copy of the old value.
 */
export const remoteProgress = (p: PendingEntry, cached?: number) =>
  p.before ? (p.before.progress ?? undefined) : cached;

/** One line for what a pending change does; `remoteProgress` is AniList's. */
export function pendingSummary(p: PendingEntry, remoteProgress?: number) {
  if (p.remove) return "Removed from list";
  const { edits } = p;
  const progress = edits?.progress ?? p.progress;
  const parts = [
    // The reader's progress has no entry id either: only edits can add one
    edits && p.entryId === undefined && !p.before && "Added to list",
    edits?.status && MANGA_STATUSES[edits.status],
    progress !== undefined &&
      (remoteProgress === undefined
        ? `Chapter ${progress}`
        : `Chapter ${remoteProgress} → ${progress}`),
    edits?.score !== undefined && `Score ${edits.score}`,
    edits?.startedAt && "Start date",
    edits?.completedAt && "Finish date",
    edits?.customLists && "Custom lists",
  ];
  return parts.filter(Boolean).join(" · ");
}
