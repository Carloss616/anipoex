import { observable } from "@legendapp/state";
import type { LibraryEntry, LibraryQueue } from "../utils/library-run";

export interface QueuedManga extends LibraryEntry {
  id: string;
  order: number;
  state: "queued" | "running";
}

/** The Reading scan's manga by id, a counter: a retry can sit beside its running manga. */
export const readingQueue$ = observable<Record<string, QueuedManga>>({});

export interface ReadingRun {
  startedAt: number;
  done: number;
  /** By manga id, so a retry counts once. */
  withNew: Record<string, true>;
  /** By source id, the manga each slow source was left out of. */
  skipped: Record<string, { name: string; mangaIds: number[] }>;
}

/** The running Reading scan's tally; null when none runs. Not persisted. */
export const readingRun$ = observable<ReadingRun | null>(null);

let lastId = 0;

const queued = () =>
  Object.values(readingQueue$.peek()).filter((m) => m.state === "queued");

const add = (entry: LibraryEntry, order: number) => {
  const id = String(++lastId);
  readingQueue$[id].set({ ...entry, id, order, state: "queued" });
};

const ifQueued = (id: string) =>
  readingQueue$[id].state.peek() === "queued" ? readingQueue$[id] : undefined;

/** Queues the entries in order and starts a fresh run. */
export function fillQueue(entries: LibraryEntry[]) {
  readingQueue$.set({});
  entries.forEach((entry, i) => {
    add(entry, i);
  });
  readingRun$.set({ startedAt: Date.now(), done: 0, withNew: {}, skipped: {} });
}

export const readingQueue: LibraryQueue<QueuedManga> = {
  next() {
    const first = queued().sort((a, b) => a.order - b.order)[0];
    if (!first) return undefined;
    readingQueue$[first.id].state.set("running");
    return { ...first, state: "running" };
  },
  left: () => queued().length,
};

/** A manga's scan ended: it leaves the queue and counts as done. */
export function settle(id: string) {
  readingQueue$[id].delete();
  // A scan still ending after a failed run has nothing to count into.
  if (readingRun$.peek()) readingRun$.done.set((n) => (n ?? 0) + 1);
}

export function scanNext(id: string) {
  const item = ifQueued(id);
  if (!item) return;
  item.order.set(Math.min(...queued().map((m) => m.order)) - 1);
}

export function removeFromQueue(id: string) {
  ifQueued(id)?.delete();
}

/** Drops every queued manga; the running ones finish. */
export function clearQueue() {
  for (const m of queued()) readingQueue$[m.id].delete();
}

/** Queues the manga last, to scan only `sourceId`, unless it's already queued for it. */
export function queueRetry(entry: LibraryEntry, sourceId: string) {
  const all = Object.values(readingQueue$.peek());
  const waiting = all.find(
    (m) => m.state === "queued" && m.mangaId === entry.mangaId,
  );
  if (waiting) {
    // Queued for every source already, or for this one.
    if (!waiting.only || waiting.only.includes(sourceId)) return;
    readingQueue$[waiting.id].only.set([...waiting.only, sourceId]);
    return;
  }
  add(
    { ...entry, only: [sourceId] },
    Math.max(-1, ...all.map((m) => m.order)) + 1,
  );
}

export function endRun() {
  readingQueue$.set({});
  readingRun$.set(null);
}
