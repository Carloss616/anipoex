import { useEffect, useRef } from "react";
import { useInstalledSources } from "@/features/extensions";
import { exclusions$, pins$ } from "@/features/manga/state/exclusions";
import { isScanning, scanSources } from "@/features/manga/state/probes";
import { deselectSource } from "@/features/manga/state/source";
import { type ExcludeReason, mediaKey } from "@/features/manga/utils/msu";
import {
  clearAutoExclusions,
  clearExclusions,
  toggleExcluded,
} from "@/features/manga/utils/source-exclusions";
import { searchTitles } from "@/features/manga/utils/source-match";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

/** Everything the sheet can do to a manga's sources; nothing here runs until the user acts. */
export function useSourceActions({
  manga,
  read,
  selectedId,
}: {
  manga: Pick<MangaDetail, "id" | "title" | "synonyms">;
  read: number;
  selectedId: string | undefined;
}) {
  const sources = useInstalledSources();
  const key = mediaKey(manga.id);
  // A scan outlives the sheet; it reads the latest progress when it ends.
  // Synced in an effect: a ref written in render makes the Compiler skip
  // this hook, and every memoized row would get new actions.
  const readRef = useRef(read);
  useEffect(() => {
    readRef.current = read;
  }, [read]);

  const scan = (only?: string[]) =>
    scanSources({
      mangaId: manga.id,
      sources,
      titles: searchTitles(manga),
      read: () => readRef.current,
      keep: selectedId,
      only,
    });
  const scanAll = () => void scan();
  const rescan = (id: string) => void scan([id]);

  const toggle = (id: string, exclude: boolean, reason: ExcludeReason) => {
    const next = toggleExcluded(
      exclusions$[key].peek() ?? {},
      pins$[key].peek() ?? {},
      id,
      exclude,
      reason,
      Date.now(),
    );
    exclusions$[key].set(next.excluded);
    pins$[key].set(next.pinned);
  };

  return {
    scanAll,
    rescan,
    // An excluded source isn't read, so it stops being the chosen one.
    exclude: (id: string, reason: ExcludeReason) => {
      toggle(id, true, reason);
      deselectSource(manga.id, id);
    },
    deselect: (id: string) => deselectSource(manga.id, id),
    // A dialog opened before a scan can confirm during it; the one-scan guard would drop the follow-up scan, so nothing is written.
    include: (id: string) => {
      if (isScanning(manga.id)) return;
      toggle(id, false, "other");
      rescan(id);
    },
    retryAuto: () => {
      if (isScanning(manga.id)) return;
      exclusions$[key].set(
        clearAutoExclusions(
          exclusions$[key].peek() ?? {},
          pins$[key].peek() ?? {},
          Date.now(),
        ),
      );
      scanAll();
    },
    resetAll: () => {
      if (isScanning(manga.id)) return;
      const next = clearExclusions(
        exclusions$[key].peek() ?? {},
        pins$[key].peek() ?? {},
        Date.now(),
      );
      exclusions$[key].set(next.excluded);
      pins$[key].set(next.pinned);
      scanAll();
    },
  };
}

export type SourceActions = ReturnType<typeof useSourceActions>;
