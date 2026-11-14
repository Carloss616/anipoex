import { observable } from "@legendapp/state";
import type { ScanActivity, ScanActivityArgs } from "../utils/scan-activity";
import {
  marksById,
  type RowState,
  type SourceMark,
} from "../utils/scan-activity/utils/marks";

export interface ActiveMark extends Omit<SourceMark, "state"> {
  state: RowState;
}

export interface ActiveScan {
  mangaId: number;
  name: string;
  cover?: string;
  marks: Record<string, ActiveMark>;
}

/** Every manga with a scan running, by manga id, its scans' sources merged; not persisted. */
export const activeScans$ = observable<Record<string, ActiveScan>>({});

/** Scans running per manga: its row goes when the last one ends. */
const live = new Map<number, number>();

/** Shows the scan in `activeScans$` until it ends. */
export function trackActiveScan({
  mangaId,
  name,
  cover,
  sources,
}: ScanActivityArgs): ScanActivity & {
  /** The source left the scan unread: stopped, or skipped as slow. */
  leave(id: string, state: "skipped" | "stopped"): void;
} {
  live.set(mangaId, (live.get(mangaId) ?? 0) + 1);
  const scan$ = activeScans$[mangaId];
  if (!scan$.peek())
    scan$.set({ mangaId, name, cover, marks: marksById(sources) });
  else for (const mark of sources) scan$.marks[mark.id].set(mark);
  let ended = false;
  const write = (id: string, mark: Partial<ActiveMark>) => {
    const mark$ = scan$.marks[id];
    const current = mark$.peek();
    if (current) mark$.set({ ...current, ...mark });
  };
  return {
    progress() {},
    mark: write,
    leave: (id, state) => write(id, { state }),
    end() {
      if (ended) return;
      ended = true;
      const left = (live.get(mangaId) ?? 1) - 1;
      if (left > 0) return live.set(mangaId, left);
      live.delete(mangaId);
      scan$.delete();
    },
  };
}

/** One activity that passes every call on to each of `all`. */
export function teeActivity(...all: ScanActivity[]): ScanActivity {
  return {
    progress: (done) => {
      for (const a of all) a.progress(done);
    },
    mark: (id, mark) => {
      for (const a of all) a.mark(id, mark);
    },
    end: (found) => {
      for (const a of all) a.end(found);
    },
  };
}
