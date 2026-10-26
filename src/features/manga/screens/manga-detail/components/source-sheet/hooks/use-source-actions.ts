import { useEffect, useRef } from "react";
import { useInstalledSources } from "@/features/extensions";
import {
  decideByHand,
  exclusions$,
  pins$,
} from "@/features/manga/state/exclusions";
import type { ManualMatch } from "@/features/manga/state/manual-matches";
import {
  removeMatchByHand,
  setMatchByHand,
} from "@/features/manga/state/match-by-hand";
import {
  isScanning,
  scanning$,
  scanSources,
} from "@/features/manga/state/probes";
import { deselectSource } from "@/features/manga/state/source";
import {
  isTitleSearching,
  startTitleSearch,
  stopTitleSearch,
  titleQuery$,
} from "@/features/manga/state/title-search";
import { type ExcludeReason, mediaKey } from "@/features/manga/utils/msu";
import { openSourcePage } from "@/features/manga/utils/open-source-page";
import type { Source } from "@/features/manga/utils/source";
import {
  clearAutoExclusions,
  clearExclusions,
} from "@/features/manga/utils/source-exclusions";
import { searchTitles } from "@/features/manga/utils/source-match";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { openExternal } from "@/utils/open-external";

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
      name: manga.title?.userPreferred ?? undefined,
    });
  const scanAll = () => void scan();
  const rescan = (id: string) => void scan([id]);

  const toggle = (id: string, exclude: boolean, reason: ExcludeReason) =>
    decideByHand(manga.id, id, exclude, reason);
  const source = (id: string) =>
    sources.find((entry) => entry.id === id) ?? { id, name: id };
  // The title being searched, else the first one a pick searches by.
  const query = () =>
    titleQuery$[key].peek() ?? searchTitles(manga).search[0] ?? "";

  return {
    scanAll,
    rescan,
    searchOn: (id: string) => void startTitleSearch(manga.id, [id], query()),
    stopSearch: (id?: string) => stopTitleSearch(manga.id, id),
    // On while any source searches: then it stops them all.
    searchAll: (ids: string[]) =>
      isTitleSearching(key)
        ? stopTitleSearch(manga.id)
        : void startTitleSearch(manga.id, ids, query()),
    // The sheet stays open; the row's status follows the new page.
    setMatch: (id: string, match: ManualMatch) => {
      // A probe of this source in flight would land over the change.
      if (scanning$[key][id].peek()) return;
      setMatchByHand(manga.id, source(id), match);
      rescan(id);
    },
    removeMatch: (id: string) =>
      !scanning$[key][id].peek() &&
      void removeMatchByHand(manga.id, source(id), searchTitles(manga)).then(
        () => rescan(id),
      ),
    openPage: (id: string, url: string) => void openSourcePage(id, url),
    // Without a match, the source's homepage, to look for the manga by hand.
    openWebsite: (source: Source, page: string | undefined) =>
      page
        ? void openSourcePage(source.id, page)
        : source.homeUrl && void openExternal(source.homeUrl),
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
