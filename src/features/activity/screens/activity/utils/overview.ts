import { activeScans$ } from "@/features/manga/state/active-scans";
import {
  readingQueue$,
  readingRun$,
} from "@/features/manga/state/reading-queue";

/** Each figure of the overview, read on its own so each updates alone. */
export const figures = {
  reading: () => readingRun$.get(true) != null,
  done: () => readingRun$.done.get() ?? 0,
  /** Running or queued. */
  left: () => Object.keys(readingQueue$.get(true)).length,
  total: () => figures.done() + figures.left(),
  withNew: () => Object.keys(readingRun$.withNew.get(true) ?? {}).length,
  skipped: () => Object.keys(readingRun$.skipped.get(true) ?? {}).length,
  scans: () => Object.keys(activeScans$.get(true)).length,
  since: () => {
    const at = readingRun$.startedAt.get();
    return at
      ? `Since ${new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      : "";
  },
};
