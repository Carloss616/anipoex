import { useValue } from "@legendapp/state/react";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { manualMatches$ } from "@/features/manga/state/manual-matches";
import { scanning$ } from "@/features/manga/state/probes";
import {
  loadMoreTitles,
  titleSearch$,
} from "@/features/manga/state/title-search";
import { bestSimilar } from "@/features/manga/utils/source-match";
import type { SourceActions } from "../../../hooks/use-source-actions";
import {
  type RailItem,
  railItems,
  railNotice,
} from "../../../utils/rail-items";
import { cardMenu } from "../utils/card-menu";

/** A source's rail: its results, current match first, and each card's menu. */
export function useRail(
  mangaKey: string,
  mangaId: number,
  sourceId: string,
  actions: SourceActions,
) {
  const rail = useValue(titleSearch$[mangaKey][sourceId]);
  const manual = useValue(manualMatches$[mangaKey][sourceId]);
  // The page the source matched before, which its stored chapters came from.
  const stored = useValue(() =>
    chapters$[chaptersKey(mangaId, sourceId)].manga.get(),
  );
  // A probe in flight would land over a match change: match actions wait.
  const scanning = useValue(() => scanning$[mangaKey][sourceId].get() === true);
  const current = manual ?? stored;
  // Suggested only while nothing matches: a url, so the card re-renders only
  // when the suggestion changes.
  const similar = useValue(() => {
    const loaded = titleSearch$[mangaKey][sourceId].get();
    if (current || loaded?.status !== "done") return undefined;
    return bestSimilar(loaded.mangas, actions.titles().all)?.url;
  });
  const items = rail
    ? railItems(current, rail.mangas, {
        byTitle: manual?.by === "title",
        similar,
      })
    : [];

  return {
    rail,
    items,
    notice: rail ? railNotice(rail) : null,
    menu: (item: RailItem) =>
      cardMenu(
        item,
        !!manual,
        {
          setMatch: (manga) => actions.setMatch(sourceId, manga),
          removeMatch: () => actions.removeMatch(sourceId),
          openPage: (url) => actions.openPage(sourceId, url),
        },
        scanning,
      ),
    loadMore: () => void loadMoreTitles(mangaId, sourceId),
    retry: () => actions.searchOn(sourceId),
  };
}
