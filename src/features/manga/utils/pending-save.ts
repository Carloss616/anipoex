import type { SaveMangaTrackingMutationVariables } from "../graphql/manga-tracking.generated";
import {
  type PartialEntry,
  setProgress,
  toSaveVariables,
  toTrackingForm,
} from "./tracking-form";

/**
 * Progress kept offline, saved on AniList's current entry as the tracking sheet
 * would save that progress: its rules derive the status, so a pause set
 * elsewhere stays. Null when there is nothing to send: AniList has as much or
 * more (read on another device), or the entry left the list.
 */
export function pendingSave(
  mediaId: number,
  progress: number,
  entry: (PartialEntry & { id: number }) | null | undefined,
  total: number | null | undefined,
  today: Date,
): SaveMangaTrackingMutationVariables | null {
  if (!entry || (entry.progress ?? 0) >= progress) return null;

  const before = toTrackingForm(entry);
  const after = setProgress(before, progress, total, today);
  return toSaveVariables(before, after, { mediaId, entryId: entry.id });
}
