import { MANGA_STATUSES } from "@/features/manga/screens/manga-list/constants";
import {
  type FuzzyDateInput,
  MediaListStatus,
} from "@/graphql/types.generated";
import { formatDate } from "@/utils/utils";
import {
  fromFuzzyDate,
  type PartialFuzzyDate,
  toFuzzyDate,
} from "./fuzzy-date";

export interface TrackingForm {
  status?: MediaListStatus;
  progress: number;
  score: number;
  startedAt?: Date;
  completedAt?: Date;
}

interface PartialEntry {
  status?: MediaListStatus | null;
  progress?: number | null;
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
  startedAt: FuzzyDateInput;
  completedAt: FuzzyDateInput;
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
  };
}

export function setStatus(
  form: TrackingForm,
  status: MediaListStatus | undefined,
  total: number | null | undefined,
  today: Date,
): TrackingForm {
  const next: TrackingForm = { ...form, status };

  if (status === READING) {
    next.startedAt ??= today;
  }

  if (status === FINISHED) {
    if (total) next.progress = total;
    next.startedAt ??= today;
    next.completedAt ??= today;
  } else if (form.status === FINISHED) {
    // Undoing Completed takes back the finish date it stamped. The progress it
    // filled stays — there is nothing to restore it from, and it is on screen.
    next.completedAt = undefined;
  }

  return next;
}

export function setProgress(
  form: TrackingForm,
  progress: number,
  total: number | null | undefined,
  today: Date,
): TrackingForm {
  const clamped = Math.max(0, total ? Math.min(progress, total) : progress);
  const next: TrackingForm = { ...form, progress: clamped };

  // Today is an honest start date only at the very first chapter. Further in,
  // the entry was started on some day the user no longer knows — stamping it
  // would invent one, so an empty start date stays empty.
  if (form.progress === 0 && clamped > 0) next.startedAt ??= today;

  // Only the two "in progress" statuses roll over into Completed — a dropped
  // or paused entry the user is correcting keeps the status they chose.
  if (
    total &&
    clamped === total &&
    (form.status === READING || form.status === MediaListStatus.Planning)
  ) {
    next.status = FINISHED;
    next.completedAt ??= today;
  }

  return next;
}

export function toSaveVariables(
  form: TrackingForm,
  { mediaId, entryId }: { mediaId: number; entryId?: number | null },
): SaveVariables {
  return {
    ...(entryId ? { id: entryId } : undefined),
    mediaId,
    status: form.status,
    progress: form.progress,
    score: form.score,
    startedAt: toFuzzyDate(form.startedAt),
    completedAt: toFuzzyDate(form.completedAt),
  };
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
 * before the user confirms. The field being edited is left out — it is the
 * control they are already looking at.
 */
export function describeChanges(
  before: TrackingForm,
  after: TrackingForm,
  edited: keyof TrackingForm,
  total?: number | null,
): string[] {
  return CHANGED_FIELDS.filter((field) => field !== edited).flatMap((field) => {
    const label = CHANGE_LABELS[field];

    if (field === "status") {
      if (after.status === before.status) return [];
      const title = MANGA_STATUSES.find(
        (entry) => entry.status === after.status,
      )?.title;
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
