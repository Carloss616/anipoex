import { MANGA_STATUSES } from "@/features/manga/constants";
import {
  type FuzzyDateInput,
  MediaListStatus,
} from "@/graphql/types.generated";
import { formatDate } from "@/utils/utils";
import type { PendingEdits } from "../state/pending-entries";
import {
  fromFuzzyDate,
  type PartialFuzzyDate,
  toFuzzyDate,
} from "./fuzzy-date";
import type { ReadDates } from "./read-dates";

export interface TrackingForm {
  status?: MediaListStatus;
  progress: number;
  score: number;
  startedAt?: Date;
  completedAt?: Date;
  /** Times the manga was read again; only read, never saved from here. */
  repeat: number;
}

export interface PartialEntry {
  status?: MediaListStatus | null;
  progress?: number | null;
  repeat?: number | null;
  score?: number | null;
  startedAt?: PartialFuzzyDate;
  completedAt?: PartialFuzzyDate;
}

export interface SaveVariables {
  id?: number;
  mediaId: number;
  status?: MediaListStatus;
  progress: number;
  score: number;
  startedAt?: FuzzyDateInput;
  completedAt?: FuzzyDateInput;
}

/** The statuses the auto-rules may move the entry into. */
const READING = MediaListStatus.Current;
const FINISHED = MediaListStatus.Completed;

export function toTrackingForm(
  entry: PartialEntry | null | undefined,
): TrackingForm {
  return {
    status: entry?.status ?? undefined,
    progress: entry?.progress ?? 0,
    score: entry?.score ?? 0,
    startedAt: fromFuzzyDate(entry?.startedAt),
    completedAt: fromFuzzyDate(entry?.completedAt),
    repeat: entry?.repeat ?? 0,
  };
}

/**
 * `read` holds when the reading began and ended, if known: marking Completed
 * long after the last chapter (a source that stopped short of AniList's
 * count) dates it then, not today.
 */
export function setStatus(
  form: TrackingForm,
  status: MediaListStatus | undefined,
  total: number | null | undefined,
  today: Date,
  read: ReadDates = {},
): TrackingForm {
  const next: TrackingForm = { ...form, status };

  if (status === READING) {
    next.startedAt ??= today;
  }

  if (status === FINISHED) {
    if (total) next.progress = total;
    // Today can't start a reading that ended earlier: leave it unknown.
    next.startedAt ??= read.startedAt ?? (read.completedAt ? undefined : today);
    next.completedAt ??= read.completedAt ?? today;
  } else if (form.status === FINISHED) {
    // Undoing Completed takes back the finish date it stamped. The progress it
    // filled stays — there is nothing to restore it from, and it is on screen.
    next.completedAt = undefined;
  }

  return next;
}

/** `read` dates a Completed the last chapter brings, as in `setStatus`. */
export function setProgress(
  form: TrackingForm,
  progress: number,
  total: number | null | undefined,
  today: Date,
  read: ReadDates = {},
): TrackingForm {
  const clamped = Math.max(0, total ? Math.min(progress, total) : progress);
  const next: TrackingForm = { ...form, progress: clamped };

  // Today is an honest start date only at the first chapter; further in, it
  // would invent a day the user no longer knows.
  if (form.progress === 0 && clamped > 0) next.startedAt ??= today;

  // Only the two "in progress" statuses roll over into Completed — a dropped
  // or paused entry the user is correcting keeps the status they chose.
  if (
    total &&
    clamped === total &&
    (form.status === READING || form.status === MediaListStatus.Planning)
  ) {
    next.status = FINISHED;
    next.completedAt ??= read.completedAt ?? today;
  }

  return next;
}

/**
 * Dates go out only when they changed: AniList leaves an omitted date alone,
 * while an untouched partial date (read as unset) would go out as the null
 * triple that erases it.
 */
export function toSaveVariables(
  before: TrackingForm,
  form: TrackingForm,
  { mediaId, entryId }: { mediaId: number; entryId?: number | null },
): SaveVariables {
  const changed = (field: "startedAt" | "completedAt") =>
    form[field]?.getTime() !== before[field]?.getTime();

  return {
    ...(entryId ? { id: entryId } : undefined),
    mediaId,
    status: form.status,
    progress: form.progress,
    score: form.score,
    ...(changed("startedAt")
      ? { startedAt: toFuzzyDate(form.startedAt) }
      : undefined),
    ...(changed("completedAt")
      ? { completedAt: toFuzzyDate(form.completedAt) }
      : undefined),
  };
}

/** The fields `after` changed, as a change queued offline keeps them. */
export function toPendingEdits(
  before: TrackingForm,
  after: TrackingForm,
): PendingEdits {
  const edits: PendingEdits = {};
  if (after.status !== before.status) edits.status = after.status;
  if (after.progress !== before.progress) edits.progress = after.progress;
  if (after.score !== before.score) edits.score = after.score;
  for (const field of ["startedAt", "completedAt"] as const) {
    if (after[field]?.getTime() !== before[field]?.getTime())
      edits[field] = toFuzzyDate(after[field]);
  }
  return edits;
}

/** The fields the auto-rules touch, in the order the sheet lists them. */
const CHANGE_LABELS = {
  status: "Status",
  progress: "Progress",
  startedAt: "Start date",
  completedAt: "Finish date",
} as const;

const CHANGED_FIELDS = Object.keys(
  CHANGE_LABELS,
) as (keyof typeof CHANGE_LABELS)[];

/**
 * The side effects a rule is about to apply, as lines the sheet can show
 * before the user confirms. The field being edited, if any, is left out — it
 * is the control they are already looking at.
 */
export function describeChanges(
  before: TrackingForm,
  after: TrackingForm,
  edited?: keyof TrackingForm,
  total?: number | null,
): string[] {
  return CHANGED_FIELDS.filter((field) => field !== edited).flatMap((field) => {
    const label = CHANGE_LABELS[field];

    if (field === "status") {
      if (after.status === before.status) return [];
      const title = after.status && MANGA_STATUSES[after.status];
      return `${label} → ${title ?? after.status}`;
    }

    if (field === "progress") {
      if (after.progress === before.progress) return [];
      return `${label} → ${after.progress}${total ? `/${total}` : ""}`;
    }

    const next = after[field];
    if (next?.getTime() === before[field]?.getTime()) return [];
    return next ? `${label} → ${formatDate(next)}` : `${label} cleared`;
  });
}
