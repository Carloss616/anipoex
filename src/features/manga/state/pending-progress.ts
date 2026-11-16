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

/** Keeps the higher progress; a progress that isn't lower also brings its status. */
export function keepPending(
  mediaId: number,
  next: { progress: number; status?: MediaListStatus },
) {
  const kept = pendingProgress$[mediaId].peek();
  if (kept && next.progress < kept.progress) {
    pendingProgress$[mediaId].set({
      ...kept,
      at: Date.now(),
      error: undefined,
    });
    return;
  }
  pendingProgress$[mediaId].set({
    progress: next.progress,
    status: next.status,
    at: Date.now(),
  });
}

export function effectiveProgress(
  remote: number | null | undefined,
  mediaId: number,
): number {
  return Math.max(remote ?? 0, pendingProgress$[mediaId].get()?.progress ?? 0);
}

/** Keeps a save that failed for want of a connection; false for any other failure. */
export function keepIfOffline(
  error: unknown,
  mediaId: number,
  next: { progress: number; status?: MediaListStatus },
): boolean {
  if (!isNetworkError(error)) return false;
  keepPending(mediaId, next);
  return true;
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
