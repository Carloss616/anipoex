import type { PendingEdits, PendingEntry } from "../state/pending-entries";
import { fromFuzzyDate } from "./fuzzy-date";
import {
  type PartialEntry,
  type SaveVariables,
  sameSet,
  setProgress,
  type TrackingForm,
  toSaveVariables,
  toTrackingForm,
} from "./tracking-form";

export type PendingWrite =
  | { kind: "save"; variables: SaveVariables }
  | { kind: "delete"; id: number };

const save = (variables: SaveVariables): PendingWrite => ({
  kind: "save",
  variables,
});

/** `names`, the account's lists now, drops any deleted since the edit. */
const listed = (lists: string[], names: string[] | null | undefined) =>
  names ? lists.filter((name) => names.includes(name)) : lists;

function applyEdits(
  form: TrackingForm,
  { startedAt, completedAt, customLists, ...fields }: PendingEdits = {},
  names?: string[] | null,
): TrackingForm {
  return {
    ...form,
    ...fields,
    ...(startedAt && { startedAt: fromFuzzyDate(startedAt) }),
    ...(completedAt && { completedAt: fromFuzzyDate(completedAt) }),
    ...(customLists && { customLists: listed(customLists, names) }),
  };
}

const unchanged = (a: TrackingForm, b: TrackingForm) =>
  a.status === b.status &&
  a.progress === b.progress &&
  a.score === b.score &&
  a.startedAt?.getTime() === b.startedAt?.getTime() &&
  a.completedAt?.getTime() === b.completedAt?.getTime() &&
  sameSet(a.customLists, b.customLists);

/**
 * What to write for one pending entry, over AniList's current entry: edited
 * fields win and the rest keep AniList's, so a change made elsewhere stays.
 * The reader's progress goes out only past AniList's, with the tracking rules.
 * Null when there is nothing to send: AniList already has it, or the entry
 * left the list elsewhere. `names` is the account's lists, needed only when
 * the edit holds lists.
 */
export function pendingWrite(
  mediaId: number,
  pending: PendingEntry,
  entry: (PartialEntry & { id: number }) | null | undefined,
  total: number | null | undefined,
  today: Date,
  names?: string[] | null,
): PendingWrite | null {
  if (pending.remove) return entry ? { kind: "delete", id: entry.id } : null;
  if (!entry) {
    // Only an entry added on this device is created again
    if (pending.entryId !== undefined || !pending.edits?.status) return null;
    return save({
      mediaId,
      ...pending.edits,
      progress: pending.edits.progress ?? pending.progress ?? 0,
      score: pending.edits.score ?? 0,
      ...(pending.edits.customLists && {
        customLists: listed(pending.edits.customLists, names),
      }),
    });
  }

  const before = toTrackingForm(entry, names);
  let after = applyEdits(before, pending.edits, names);
  if (
    pending.edits?.progress === undefined &&
    pending.progress !== undefined &&
    pending.progress > before.progress
  )
    after = setProgress(after, pending.progress, total, today);
  return unchanged(before, after)
    ? null
    : save(toSaveVariables(before, after, { mediaId, entryId: entry.id }));
}
