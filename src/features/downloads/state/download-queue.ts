import { batch, observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import { chapterHash, downloadKey } from "../utils/paths";

export interface QueuedDownload {
  key: string;
  order: number;
  state: "queued" | "running" | "failed";
  error?: string;
  manga: { id: number; title: string; cover?: string };
  source: { id: string; name: string };
  chapter: {
    url: string;
    name: string;
    number: number;
    scanlator: string | null;
    memo: string | null;
  };
}

export const downloadQueue$ = observable<Record<string, QueuedDownload>>({});

syncObservable(downloadQueue$, {
  persist: { name: "download-queue", plugin: ObservablePersist },
});

/** 0..1 per key, only while a chapter runs. */
export const downloadProgress$ = observable<Record<string, number>>({});

/** Where each downloaded chapter lives: `mangaId/sourceId` → hash → place. */
export const downloaded$ = observable<
  Record<string, Record<string, "local" | "cloud">>
>({});

// An object root: a boolean root takes whatever the plugin loads, `{}` included.
const pause$ = observable({ byUser: false });

syncObservable(pause$, {
  persist: { name: "downloads-paused", plugin: ObservablePersist },
});

/** The user's pause: it holds across restarts until Resume. */
export const downloadsPaused$ = pause$.byUser;

/** iOS's pause as its background time runs out: it ends with the app. */
export const downloadsSuspended$ = observable(false);

/** No connection: the queue waits and starts again by itself when it returns. */
export const downloadsOffline$ = observable(false);

/** Callbacks stay out of observables: a function with no arguments would run as a computed. */
export const downloadStops = new Map<string, () => void>();

const sorted = () =>
  Object.values(downloadQueue$.peek()).sort((a, b) => a.order - b.order);

/** Adds what isn't queued or downloaded yet and returns how many were added. */
export function enqueue(
  items: Omit<QueuedDownload, "key" | "order" | "state">[],
) {
  const queue = downloadQueue$.peek();
  let next = Math.max(-1, ...Object.values(queue).map((e) => e.order)) + 1;
  const seen = new Set<string>();
  let added = 0;
  batch(() => {
    for (const item of items) {
      const hash = chapterHash(item.chapter.url);
      const key = downloadKey(item.manga.id, item.source.id, hash);
      if (key in queue || seen.has(key)) continue;
      if (downloaded$.peek()[`${item.manga.id}/${item.source.id}`]?.[hash])
        continue;
      downloadQueue$[key].set({ ...item, key, order: next++, state: "queued" });
      seen.add(key);
      added++;
    }
  });
  return added;
}

export function cancel(key: string) {
  downloadStops.get(key)?.();
  downloadStops.delete(key);
  batch(() => {
    downloadQueue$[key].delete();
    downloadProgress$[key].delete();
  });
}

export function moveUp(key: string) {
  const entries = sorted().filter((e) => e.state === "queued");
  const at = entries.findIndex((e) => e.key === key);
  if (at < 1) return;
  // Legend edits the stored objects in place: read both orders before writing.
  const [before, entry] = [entries[at - 1], entries[at]];
  const [beforeOrder, entryOrder] = [before.order, entry.order];
  batch(() => {
    downloadQueue$[entry.key].order.set(beforeOrder);
    downloadQueue$[before.key].order.set(entryOrder);
  });
}

export function retry(key: string) {
  batch(() => {
    downloadQueue$[key].state.set("queued");
    downloadQueue$[key].error.delete();
  });
}

/** Requeues every failed entry: offline, a whole queue fails within seconds. */
export function retryFailed() {
  batch(() => {
    for (const entry of sorted())
      if (entry.state === "failed") retry(entry.key);
  });
}

export const queuedOf = (sourceId: string) =>
  sorted().filter((e) => e.source.id === sourceId && e.state === "queued");
