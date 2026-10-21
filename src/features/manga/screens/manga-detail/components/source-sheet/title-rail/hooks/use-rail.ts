import { useValue } from "@legendapp/state/react";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { manualMatches$ } from "@/features/manga/state/manual-matches";
import { scanning$ } from "@/features/manga/state/probes";
import {
  loadMoreTitles,
  titleSearch$,
} from "@/features/manga/state/title-search";
import type { SourceActions } from "../../hooks/use-source-actions";
import { type RailItem, railItems, railNotice } from "../../utils/rail-items";
import { cardMenu, cardTap } from "../utils/card-menu";

/** One source's rail: its results with the current match first, and each card's menu. */
export function useRail(
  mangaKey: string,
  mangaId: number,
  sourceId: string,
  actions: SourceActions,
) {
  const rail = useValue(titleSearch$[mangaKey][sourceId]);
  const manual = useValue(manualMatches$[mangaKey][sourceId]);
  // The page the source matched before: what its stored chapters were read from.
  const stored = useValue(() =>
    chapters$[chaptersKey(mangaId, sourceId)].manga.get(),
  );
  // A probe in flight would land over a match change, so the match actions wait for it.
  const scanning = useValue(() => scanning$[mangaKey][sourceId].get() === true);
  const current = manual ?? stored;
  const items = rail ? railItems(current, rail.mangas) : [];

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
    tap: (item: RailItem) =>
      cardTap(
        item,
        !!manual,
        {
          setMatch: (manga) => actions.setMatch(sourceId, manga),
          removeMatch: () => actions.removeMatch(sourceId),
        },
        scanning,
      ),
    loadMore: () => void loadMoreTitles(mangaId, sourceId),
    retry: () => actions.searchOn(sourceId),
  };
}
