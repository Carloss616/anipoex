import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { useInstalledSources } from "@/features/extensions";
import {
  decideByHand,
  exclusions$,
  pins$,
} from "@/features/manga/state/exclusions";
import {
  type ManualMatch,
  manualTitles,
  readManual,
} from "@/features/manga/state/manual-matches";
import {
  removeMatchByHand,
  setMatchByHand,
} from "@/features/manga/state/match-by-hand";
import {
  isScanning,
  scanning$,
  scanSources,
  stopScan,
} from "@/features/manga/state/probes";
import { deselectSource } from "@/features/manga/state/source";
import {
  onTitlePage,
  startTitleSearch,
  stopTitleSearch,
  titleQuery$,
  titleSearch$,
} from "@/features/manga/state/title-search";
import { forgetByTitle, takeByTitle } from "@/features/manga/state/title-takes";
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

/** The sheet's actions on a manga's sources; none runs until the user acts. */
export function useSourceActions({
  manga,
  read,
  selectedId,
}: {
  manga: Pick<MangaDetail, "id" | "title" | "synonyms" | "coverImage">;
  read: number;
  selectedId: string | undefined;
}) {
  const sources = useInstalledSources(selectedId);
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
      titles: searchTitles(manga, manualTitles(manga.id)),
      read: () => readRef.current,
      keep: selectedId,
      only,
      name: manga.title?.userPreferred ?? undefined,
      cover: manga.coverImage?.medium ?? undefined,
    });
  const scanAll = () => void scan();
  const rescan = (id: string) => void scan([id]);
  // While the source scans, its rescan control stops it.
  const stop = (id: string) => stopScan(key, id);

  const toggle = (id: string, exclude: boolean, reason: ExcludeReason) =>
    decideByHand(manga.id, id, exclude, reason);
  const source = (id: string) =>
    sources.find((entry) => entry.id === id) ?? { id, name: id };
  // The title being searched, else the first one a pick searches by.
  const query = () =>
    titleQuery$[key].peek() ?? searchTitles(manga).search[0] ?? "";
  const titles = () => searchTitles(manga, manualTitles(manga.id));
  const take = (ids?: string[]) => takeByTitle(manga.id, titles(), source, ids);
  const forget = (id: string) => forgetByTitle(manga.id, id, source);

  // Each page of title results that lands is checked for a known title.
  // Registered on every render, so it reads the latest sources and pick.
  useEffect(() =>
    onTitlePage(manga.id, (sourceId) => {
      const taken = take([sourceId]);
      if (taken.length) void scan(taken);
    }),
  );

  return {
    titles,
    scanAll,
    rescan,
    stop,
    searchOn: (id: string) => void startTitleSearch(manga.id, [id], query()),
    stopSearch: (id?: string) => stopTitleSearch(manga.id, id),
    // Adds sources to the title search; the ones searching keep their results.
    searchSources: (ids: string[]) =>
      void startTitleSearch(manga.id, ids, query()),
    // A few sources (the Excluded section): adds the ones not searching, and
    // stops them once all are.
    searchIn: (ids: string[]) => {
      const idle = ids.filter(
        (id) => titleSearch$[key][id].peek() === undefined,
      );
      if (idle.length) void startTitleSearch(manga.id, idle, query());
      else for (const id of ids) stopTitleSearch(manga.id, id);
    },
    // The sheet stays open and the source's search ends; the row's status
    // follows the new page. Sources whose title results hold the same title
    // follow it, undoable together.
    setMatch: (id: string, match: ManualMatch) => {
      // A probe of this source in flight would land over the change.
      if (scanning$[key][id].peek()) return;
      setMatchByHand(manga.id, source(id), match);
      stopTitleSearch(manga.id, id);
      const taken = take();
      void scan([id, ...taken]);
      if (taken.length)
        toast(
          `Matched ${taken.length} more source${taken.length > 1 ? "s" : ""} by title`,
          {
            action: {
              label: "Unmatch",
              onAction: () => taken.forEach(forget),
            },
          },
        );
    },
    removeMatch: (id: string) =>
      readManual(manga.id, id)?.by === "title"
        ? forget(id)
        : !scanning$[key][id].peek() &&
          void removeMatchByHand(
            manga.id,
            source(id),
            // Without the page being removed, or the search would take it again.
            searchTitles(manga, manualTitles(manga.id, id)),
          ).then(() => rescan(id)),
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
    // A dialog opened before this source's probe can confirm during it; the
    // rescan guard would drop the follow-up, so nothing is written.
    include: (id: string) => {
      if (scanning$[key][id].peek()) return;
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
