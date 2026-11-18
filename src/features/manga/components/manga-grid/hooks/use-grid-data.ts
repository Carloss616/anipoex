import type { Selector } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useDeferredValue } from "react";
import { columnsFor } from "@/features/manga/utils/list-view";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { settings$ } from "@/state/settings";

/** The grid's data, layout and key, deferred so a sheet tap commits first. */
export function useGridData(
  manga$: Selector<MangaEntry[]>,
  scrollKey: string | undefined,
) {
  const { current } = useBreakpoint();
  const latest = useValue(manga$);
  const manga = useDeferredValue(latest);
  const density = useDeferredValue(useValue(settings$.mangaList.density));
  const titlePosition = useDeferredValue(useValue(settings$.mangaList.title));
  const listKey = useDeferredValue(scrollKey);

  return {
    manga,
    // Behind the live list: an empty one is old data, not an empty list.
    settling: manga !== latest,
    columns: columnsFor(current, density),
    titlePosition,
    listKey,
  };
}
