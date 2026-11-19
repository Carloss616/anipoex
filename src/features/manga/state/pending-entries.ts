import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import {
  type FuzzyDateInput,
  MediaListStatus,
} from "@/graphql/types.generated";
import { isNetworkError } from "@/graphql/utils";
import { ObservablePersist } from "@/state/observable-persist";
import { toFuzzyDate } from "../utils/fuzzy-date";
import type { SaveVariables } from "../utils/tracking-form";

/** Fields edited by hand; dates as AniList takes them, so they persist. */
export type PendingEdits = Partial<Omit<SaveVariables, "id" | "mediaId">>;

/** What the cache showed before the first queued change, to put it back. */
export interface CachedFields {
  entryId: number;
  status: MediaListStatus | null;
  progress: number | null;
  score: number | null;
  startedAt: FuzzyDateInput | null;
  completedAt: FuzzyDateInput | null;
  /** Missing on a change kept before custom lists. */
  customLists?: string[];
}

export interface PendingEntry {
  /** The reader's progress, sent with the tracking rules. */
  progress?: number;
  /** Came with the reader's progress; not sent, the rules set it. */
  status?: MediaListStatus;
  edits?: PendingEdits;
  remove?: true;
  /** The AniList entry changed; none for one added offline. */
  entryId?: number;
  before?: CachedFields;
  at: number;
  error?: string;
}

/**
 * Changes to AniList entries made offline, by AniList media id, waiting to be
 * sent. Device-only.
 */
export const pendingEntries$ = observable<Record<string, PendingEntry>>({});

syncObservable(pendingEntries$, {
  // The table's old name, so the progress kept before the rename still loads
  persist: { name: "pending-progress", plugin: ObservablePersist },
});

/** What a keep wrote, and the entry it replaced, for {@link restorePending}. */
export interface Kept {
  previous?: PendingEntry;
  kept: PendingEntry;
}

/** Writes the entry `change` makes of the stored one, clearing its error. */
function keep(
  mediaId: number,
  change: (previous: PendingEntry | undefined) => Omit<PendingEntry, "at">,
): Kept {
  const stored = pendingEntries$[mediaId].peek();
  // Legend changes stored objects in place: copy both before and after the set
  const previous = stored && { ...stored };
  // Always later than the stored one: the flush tells a change apart by `at`
  const at = Math.max(Date.now(), (previous?.at ?? 0) + 1);
  const kept: PendingEntry = { ...change(previous), at };
  delete kept.error;
  pendingEntries$[mediaId].set(kept);
  return { previous, kept: { ...kept } };
}

/**
 * The reader's progress: the higher one wins, and a progress that isn't lower
 * also brings its status. Over a progress set by hand, it only raises that one.
 * `before` is kept from the first change, as in {@link keepEdits}.
 */
export function keepPending(
  mediaId: number,
  next: { progress: number; status?: MediaListStatus },
  before?: CachedFields,
): Kept {
  return keep(mediaId, (previous) => {
    const kept = { ...previous };
    const first = previous?.before ?? before;
    if (first) kept.before = first;
    const edits = previous?.edits;
    if (edits?.progress !== undefined) {
      if (edits.progress < next.progress)
        kept.edits = { ...edits, progress: next.progress };
    } else if (next.progress >= (previous?.progress ?? 0)) {
      kept.progress = next.progress;
      kept.status = next.status;
    }
    // Reading it means it stays listed
    delete kept.remove;
    return kept;
  });
}

/** What AniList gives an entry added afresh, under the fields set by hand. */
const FRESH: PendingEdits = {
  progress: 0,
  score: 0,
  startedAt: toFuzzyDate(undefined),
  completedAt: toFuzzyDate(undefined),
};

/**
 * Fields edited by hand, merged over earlier ones; `before` is kept from the
 * first change. A progress set by hand replaces the reader's. After a removal
 * it's added again, so the old entry's fields don't carry over.
 */
export function keepEdits(
  mediaId: number,
  entryId: number | undefined,
  edits: PendingEdits,
  before?: CachedFields,
): Kept {
  return keep(mediaId, (previous) => {
    const kept: Omit<PendingEntry, "at"> = {
      ...previous,
      edits: previous?.remove
        ? { ...FRESH, ...edits }
        : { ...previous?.edits, ...edits },
      entryId: entryId ?? previous?.entryId,
      before: previous?.before ?? before,
    };
    delete kept.remove;
    if (edits.progress !== undefined) delete kept.progress;
    // Added offline: the send creates it only with a status, and AniList's
    // default for one saved without is Reading
    if (kept.entryId === undefined && !kept.edits?.status)
      kept.edits = { ...kept.edits, status: MediaListStatus.Current };
    return kept;
  });
}

/** Removes the entry from the list: what was queued for it no longer counts. */
export function keepRemoval(
  mediaId: number,
  entryId: number,
  before?: CachedFields,
): Kept {
  return keep(mediaId, (previous) => ({
    remove: true,
    entryId,
    before: previous?.before ?? before,
  }));
}

/**
 * Puts back what a keep replaced, only while the entry is still the one it
 * wrote: one sent, changed or discarded since is left alone.
 */
export function restorePending(mediaId: number, { previous, kept }: Kept) {
  const now = pendingEntries$[mediaId].peek();
  if (
    !now ||
    now.at !== kept.at ||
    now.progress !== kept.progress ||
    now.status !== kept.status ||
    now.error !== kept.error
  )
    return false;
  if (previous) pendingEntries$[mediaId].set(previous);
  else pendingEntries$[mediaId].delete();
  return true;
}

export function effectiveProgress(
  remote: number | null | undefined,
  mediaId: number,
): number {
  const pending = pendingEntries$[mediaId].get();
  if (pending?.remove) return 0;
  return (
    pending?.edits?.progress ?? Math.max(remote ?? 0, pending?.progress ?? 0)
  );
}

let running: Promise<void> | undefined;

/** Sends what the remote doesn't have yet; a second call during a run shares it. */
export function flushPending(
  remoteOf: (mediaId: number) => number | undefined,
  send: (mediaId: number, pending: PendingEntry) => Promise<void>,
): Promise<void> {
  running ??= run(remoteOf, send).finally(() => {
    running = undefined;
  });
  return running;
}

async function run(
  remoteOf: (mediaId: number) => number | undefined,
  send: (mediaId: number, pending: PendingEntry) => Promise<void>,
) {
  for (const key of Object.keys(pendingEntries$.peek())) {
    const mediaId = Number(key);
    // Read afresh: a sign-out during the run clears what's left of it
    const pending = pendingEntries$[mediaId].peek();
    if (!pending) continue;
    const remote = remoteOf(mediaId);
    // Only the reader's progress can be judged from the cache alone, and only
    // while the cache holds AniList's: with `before`, it shows the kept one
    if (
      remote !== undefined &&
      !pending.before &&
      pending.progress !== undefined &&
      !pending.edits &&
      !pending.remove &&
      remote >= pending.progress
    ) {
      pendingEntries$[mediaId].delete();
      continue;
    }
    // A failed one waits for Retry, or it would fail again on every flush
    if (pending.error) continue;
    try {
      await send(mediaId, pending);
      // A change written during the send stays for the next flush
      if (pendingEntries$[mediaId].peek()?.at === pending.at) {
        pendingEntries$[mediaId].delete();
      }
    } catch (error) {
      if (isNetworkError(error)) return;
      // Setting a child of a cleared entry would bring it back as a ghost
      if (!pendingEntries$[mediaId].peek()) continue;
      pendingEntries$[mediaId].error.set(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
