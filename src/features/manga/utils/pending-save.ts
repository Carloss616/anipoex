import type { MediaListStatus } from "@/graphql/types.generated";
import type { SaveMangaTrackingMutationVariables } from "../graphql/manga-tracking.generated";
import {
  type PartialEntry,
  setProgress,
  setStatus,
  toSaveVariables,
  toTrackingForm,
} from "./tracking-form";

/**
 * Progress kept offline, saved on the cached entry as the tracking sheet would
 * save that progress and status. With no cached entry only those two go out:
 * the rest is unknown, and a blank score or date would overwrite AniList's.
 */
export function pendingSave(
  mediaId: number,
  pending: { progress: number; status?: MediaListStatus },
  entry: (PartialEntry & { id: number }) | null | undefined,
  total: number | null | undefined,
  today: Date,
): SaveMangaTrackingMutationVariables {
  const { progress, status } = pending;
  if (!entry) return { mediaId, progress, status };

  const before = toTrackingForm(entry);
  const moved = setProgress(before, progress, total, today);
  const after =
    status && status !== moved.status
      ? setStatus(moved, status, total, today)
      : moved;
  return toSaveVariables(before, after, { mediaId, entryId: entry.id });
}
