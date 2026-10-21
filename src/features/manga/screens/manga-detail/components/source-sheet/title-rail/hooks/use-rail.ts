import { useValue } from "@legendapp/state/react";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { manualMatches$ } from "@/features/manga/state/manual-matches";
import {
  loadMoreTitles,
  titleSearch$,
} from "@/features/manga/state/title-search";
import type { SourceActions } from "../../hooks/use-source-actions";
import { type RailItem, railItems } from "../../utils/rail-items";
import { cardMenu } from "../utils/card-menu";

/** Whether the source searches by title: its row mounts a rail only then. */
export const useSearching = (mangaKey: string, sourceId: string) =>
  useValue(() => titleSearch$[mangaKey][sourceId].get() !== undefined);

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
  const current = manual ?? stored;
  const items = rail ? railItems(current, rail.mangas) : [];

  return {
    rail,
    items,
    menu: (item: RailItem) =>
      cardMenu(item, !!manual, {
        setMatch: (manga) => actions.setMatch(sourceId, manga),
        removeMatch: () => actions.removeMatch(sourceId),
        openPage: (url) => actions.openPage(sourceId, url),
      }),
    loadMore: () => void loadMoreTitles(mangaId, sourceId),
    retry: () => actions.searchOn(sourceId),
  };
}
