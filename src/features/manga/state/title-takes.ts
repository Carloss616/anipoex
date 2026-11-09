import { mediaKey } from "../utils/msu";
import { isLive } from "../utils/source-exclusions";
import type { Titles } from "../utils/source-match";
import { readMatch } from "../utils/source-match";
import { matchesByTitle } from "../utils/title-matches";
import { dropChapters } from "./chapters";
import { exclusions$, pins$ } from "./exclusions";
import { clearManual, readManual } from "./manual-matches";
import { setMatchByHand } from "./match-by-hand";
import { probes$, recordProbe, scanning$, stopScan } from "./probes";
import { source$ } from "./source";
import { stopTitleSearch, titleSearch$ } from "./title-search";

type SourceOf = (sourceId: string) => { id: string; name: string };

// Pages taken by title that the user undid, per manga and source: never taken
// again this session. Not persisted.
const declined = new Set<string>();
const declineKey = (mangaId: number, sourceId: string, url: string) =>
  `${mangaId}\n${sourceId}\n${url}`;

/**
 * Takes, in the sources with title results loaded (or `ids`), a page equal to
 * a known title, kept as a manual match `by: "title"`; returns the sources
 * taken. A source keeps what it has: its own match, a probe in flight, a scan
 * match, an exclusion set by hand, or a page the user undid.
 */
export function takeByTitle(
  mangaId: number,
  titles: Titles,
  sourceOf: SourceOf,
  ids?: string[],
): string[] {
  const key = mediaKey(mangaId);
  const found = matchesByTitle(
    titleSearch$[key].peek() ?? {},
    titles.all,
    (id) =>
      (ids !== undefined && !ids.includes(id)) ||
      !!scanning$[key][id].peek() ||
      !!readManual(mangaId, id) ||
      !!probes$[key][id].peek()?.matched ||
      (isLive(exclusions$[key][id].peek()) && isLive(pins$[key][id].peek())),
  ).filter(
    ({ sourceId, manga }) =>
      !declined.has(declineKey(mangaId, sourceId, manga.url)),
  );
  for (const { sourceId, manga } of found) {
    setMatchByHand(mangaId, sourceOf(sourceId), {
      url: manga.url,
      title: manga.title,
      thumbnailUrl: manga.thumbnailUrl,
      memo: manga.memo,
      by: "title",
    });
    // Settled: its results leave the search, the user's other rows stay.
    stopTitleSearch(mangaId, sourceId);
  }
  return found.map(({ sourceId }) => sourceId);
}

/**
 * Undoes a page taken by title, for good this session, without searching
 * again: a search would take it back through the title that taught it. A
 * match the user picked is left alone.
 */
export function forgetByTitle(
  mangaId: number,
  sourceId: string,
  sourceOf: SourceOf,
) {
  const taken = readManual(mangaId, sourceId);
  if (taken?.by !== "title") return;
  declined.add(declineKey(mangaId, sourceId, taken.url));
  stopScan(mediaKey(mangaId), sourceId);
  clearManual(mangaId, sourceId);
  dropChapters(mangaId, sourceId);
  // A chosen source stays chosen, as searched with nothing matched.
  const chosen = readMatch(source$[mangaId].peek());
  if (chosen?.sourceId === sourceId)
    source$[mangaId].set({
      sourceId,
      manga: null,
      ...(chosen.auto && { auto: true as const }),
    });
  recordProbe(mangaId, sourceOf(sourceId), "no-match");
}
