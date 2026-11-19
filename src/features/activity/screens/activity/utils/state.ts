import { observable } from "@legendapp/state";
import { downloads } from "@/features/activity/utils/ids";
import { downloadQueue$ } from "@/features/downloads";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { readingRun$ } from "@/features/manga/state/reading-queue";

/** The running manga whose sources show, by manga id; not persisted. */
export const expanded$ = observable<Record<string, boolean>>({});

export const toggleExpanded = (mangaId: number) =>
  expanded$[mangaId].set((open) => !open);

/** Whether a scan runs: of any manga, or the Reading scan. */
export const hasScans = () =>
  Object.keys(activeScans$.get(true)).length > 0 ||
  readingRun$.get(true) != null;

export const downloadsFailed = () =>
  downloads().some((d) => d.state === "failed");

/** Whether a queued download comes before this queued one. */
export const canMoveUp = (key: string) =>
  downloadQueue$[key].state.get() === "queued" &&
  downloadsView$.firstQueued.get() !== key;

/**
 * Computed once per queue change, so each row's check stays O(1). Empty when
 * nothing is queued: an optional result types as a lookup, with no `get`.
 */
export const downloadsView$ = observable({
  firstQueued: (): string => {
    let first: { key: string; order: number } | undefined;
    for (const d of Object.values(downloadQueue$.get()))
      if (d.state === "queued" && (!first || d.order < first.order)) first = d;
    return first?.key ?? "";
  },
});
