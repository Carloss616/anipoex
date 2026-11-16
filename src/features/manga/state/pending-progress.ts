import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import type { MediaListStatus } from "@/graphql/types.generated";
import { isNetworkError } from "@/graphql/utils";
import { ObservablePersist } from "@/state/observable-persist";

export interface PendingProgress {
  progress: number;
  status?: MediaListStatus;
  at: number;
  error?: string;
}

/**
 * Reading progress made offline, by AniList media id, waiting to be sent.
 * Device-only.
 */
export const pendingProgress$ = observable<Record<string, PendingProgress>>({});

syncObservable(pendingProgress$, {
  persist: { name: "pending-progress", plugin: ObservablePersist },
});

/** What a keep wrote, and the entry it replaced, for {@link restorePending}. */
export interface Kept {
  previous?: PendingProgress;
  kept: PendingProgress;
}

/** Keeps the higher progress; a progress that isn't lower also brings its status. */
export function keepPending(
  mediaId: number,
  next: { progress: number; status?: MediaListStatus },
): Kept {
  const previous = pendingProgress$[mediaId].peek();
  const kept: PendingProgress =
    previous && next.progress < previous.progress
      ? { ...previous, at: Date.now(), error: undefined }
      : { progress: next.progress, status: next.status, at: Date.now() };
  pendingProgress$[mediaId].set(kept);
  // Legend changes the stored object in place, so keep a copy to compare
  return { previous, kept: { ...kept } };
}

/**
 * Puts back what a keep replaced, only while the entry is still the one it
 * wrote: one sent, changed or discarded since is left alone.
 */
export function restorePending(mediaId: number, { previous, kept }: Kept) {
  const now = pendingProgress$[mediaId].peek();
  if (
    !now ||
    now.at !== kept.at ||
    now.progress !== kept.progress ||
    now.status !== kept.status ||
    now.error !== kept.error
  )
    return;
  if (previous) pendingProgress$[mediaId].set(previous);
  else pendingProgress$[mediaId].delete();
}

export function effectiveProgress(
  remote: number | null | undefined,
  mediaId: number,
): number {
  return Math.max(remote ?? 0, pendingProgress$[mediaId].get()?.progress ?? 0);
}

/** Keeps a save that failed for want of a connection; undefined for any other failure. */
export function keepIfOffline(
  error: unknown,
  mediaId: number,
  next: { progress: number; status?: MediaListStatus },
): Kept | undefined {
  if (!isNetworkError(error)) return undefined;
  return keepPending(mediaId, next);
}

let running: Promise<void> | undefined;

/** Sends what the remote doesn't have yet; a second call during a run shares it. */
export function flushPending(
  remoteOf: (mediaId: number) => number | undefined,
  send: (mediaId: number, pending: PendingProgress) => Promise<void>,
): Promise<void> {
  running ??= run(remoteOf, send).finally(() => {
    running = undefined;
  });
  return running;
}

async function run(
  remoteOf: (mediaId: number) => number | undefined,
  send: (mediaId: number, pending: PendingProgress) => Promise<void>,
) {
  for (const key of Object.keys(pendingProgress$.peek())) {
    const mediaId = Number(key);
    // Read afresh: a sign-out during the run clears what's left of it
    const pending = pendingProgress$[mediaId].peek();
    if (!pending) continue;
    const remote = remoteOf(mediaId);
    if (remote !== undefined && remote >= pending.progress) {
      pendingProgress$[mediaId].delete();
      continue;
    }
    // A failed one waits for Retry, or it would fail again on every flush
    if (pending.error) continue;
    try {
      await send(mediaId, pending);
      // Progress written during the send stays for the next flush
      if (pendingProgress$[mediaId].peek()?.progress === pending.progress) {
        pendingProgress$[mediaId].delete();
      }
    } catch (error) {
      if (isNetworkError(error)) return;
      // Setting a child of a cleared entry would bring it back as a ghost
      if (!pendingProgress$[mediaId].peek()) continue;
      pendingProgress$[mediaId].error.set(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
