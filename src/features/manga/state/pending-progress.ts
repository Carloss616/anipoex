import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import type { MediaListStatus } from "@/graphql/types.generated";
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

// React Native, Chrome/Firefox and Safari word a failed fetch differently
const FETCH_FAILURES = new Set([
  "Network request failed",
  "Failed to fetch",
  "Load failed",
]);

/** A dropped connection, not an answer from the server (GraphQL or HTTP error). */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return FETCH_FAILURES.has(error.message);
  return typeof error === "object" && error !== null && "networkError" in error;
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
  for (const [key, pending] of Object.entries(pendingProgress$.peek())) {
    const mediaId = Number(key);
    const remote = remoteOf(mediaId);
    if (remote !== undefined && remote >= pending.progress) {
      pendingProgress$[mediaId].delete();
      continue;
    }
    try {
      await send(mediaId, pending);
      // Progress written during the send stays for the next flush
      if (pendingProgress$[mediaId].peek()?.progress === pending.progress) {
        pendingProgress$[mediaId].delete();
      }
    } catch (error) {
      if (isNetworkError(error)) return;
      pendingProgress$[mediaId].error.set(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
