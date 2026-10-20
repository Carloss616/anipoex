import { MediaListStatus } from "@/graphql/types.generated";
import {
  describeChanges,
  type PartialEntry,
  setProgress,
  setStatus,
  type TrackingForm,
  toTrackingForm,
} from "./tracking-form";

export interface ReadingSave {
  before: TrackingForm;
  after: TrackingForm;
  changes: string[];
  /** False when the manga is not in the list yet and saving would add it. */
  listed: boolean;
}

/** What finishing a chapter does to the list entry; null when progress would not rise. */
export function readingSave(
  entry: PartialEntry | null | undefined,
  chapterNumber: number,
  total: number | null | undefined,
  today: Date,
): ReadingSave | null {
  const n = Math.floor(chapterNumber);
  if (chapterNumber < 0 || n <= (entry?.progress ?? 0)) return null;

  const before = toTrackingForm(entry);
  const listed = !!entry;
  const base = listed
    ? before
    : setStatus(before, MediaListStatus.Current, total, today);
  const after = setProgress(base, n, total, today);

  return {
    before,
    after,
    changes: describeChanges(before, after, undefined, total),
    listed,
  };
}
