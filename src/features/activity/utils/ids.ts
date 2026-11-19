import { downloadQueue$ } from "@/features/downloads";
import { activeScans$ } from "@/features/manga/state/active-scans";
import {
  readingQueue$,
  readingRun$,
} from "@/features/manga/state/reading-queue";

/** Every download, in queue order. */
export const downloads = () =>
  Object.values(downloadQueue$.get()).sort((a, b) => a.order - b.order);

/** Every download's key in order, joined. */
export const downloadIds = () =>
  downloads()
    .map((d) => d.key)
    .join();

/** The running manga's ids, joined: changes only when one starts or ends. */
export const runningIds = () => Object.keys(activeScans$.get(true)).join();

/** The queued manga's ids in order, joined. */
export const queuedIds = () =>
  Object.values(readingQueue$.get())
    .filter((m) => m.state === "queued")
    .sort((a, b) => a.order - b.order)
    .map((m) => m.id)
    .join();

/** The sources skipped as slow, joined. */
export const skippedIds = () =>
  Object.keys(readingRun$.skipped.get(true) ?? {}).join();
