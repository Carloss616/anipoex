import { cache } from "@/graphql/client";
import type { MediaListStatus } from "@/graphql/types.generated";
import { session$ } from "@/state/session";
import { cachedFields, fileEdited, fileRemoved } from "../utils/file-entry";
import { type TrackingForm, toPendingEdits } from "../utils/tracking-form";
import {
  type CachedFields,
  effectiveProgress,
  type Kept,
  keepEdits,
  keepPending,
  keepRemoval,
  pendingEntries$,
  restorePending,
} from "./pending-entries";

/**
 * Keeps an edit made offline and shows it at once. One added offline has no
 * entry to write to: the sheet keeps its form until it's sent. `current` is
 * the form now, for a change that failed after newer ones were made.
 */
export function queueEdit(
  mediaId: number,
  entryId: number | undefined,
  before: TrackingForm,
  after: TrackingForm,
  current = after,
): Kept | undefined {
  const edits = toPendingEdits(before, after, current);
  if (!Object.keys(edits).length) return;
  // Read before the write below, so the first edit keeps what AniList had
  const kept = keepEdits(
    mediaId,
    entryId,
    edits,
    entryId == null ? undefined : cachedFields(cache, entryId),
  );
  if (entryId != null)
    fileEdited(cache, session$.user.peek()?.id, mediaId, entryId, edits);
  return kept;
}

/** Writes the progress the entry now shows over `before`, AniList's. */
function showProgress(mediaId: number, before: CachedFields | undefined) {
  if (!before) return;
  fileEdited(cache, session$.user.peek()?.id, mediaId, before.entryId, {
    progress: effectiveProgress(before.progress, mediaId),
  });
}

/** Keeps the reader's progress offline and shows it at once. */
export function queueProgress(
  mediaId: number,
  entryId: number | undefined,
  next: { progress: number; status?: MediaListStatus },
): Kept {
  const kept = keepPending(
    mediaId,
    next,
    entryId == null ? undefined : cachedFields(cache, entryId),
  );
  showProgress(mediaId, kept.kept.before);
  return kept;
}

/** Undoes a keep and shows the progress it had put back. */
export function undoKept(mediaId: number, kept: Kept) {
  if (restorePending(mediaId, kept)) showProgress(mediaId, kept.kept.before);
}

/** Keeps a removal made offline; the entry stays cached to put back. */
export function queueRemoval(mediaId: number, entryId: number) {
  keepRemoval(mediaId, entryId, cachedFields(cache, entryId));
  fileRemoved(cache, session$.user.peek()?.id, mediaId, entryId);
}

/** Drops what was queued for a manga and shows its entry as it was. */
export function discardPending(mediaId: number) {
  const before = pendingEntries$[mediaId].peek()?.before;
  if (before) {
    const { entryId, ...fields } = before;
    fileEdited(cache, session$.user.peek()?.id, mediaId, entryId, fields);
  }
  pendingEntries$[mediaId].delete();
}
