import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import type { ReactElement } from "react";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import type { MangaListState } from "@/features/manga/hooks/use-manga-list";
import { listView$ } from "@/features/manga/state/list-view";
import { columnsFor, toTitlePosition } from "@/features/manga/utils/list-view";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { ListEmpty } from "../list-empty";
import { ListItem } from "../list-item";

export interface ListGridProps {
  list: MangaListState;
  query$: ObservablePrimitive<string>;
  genre$: ObservablePrimitive<string>;
  /** Scrolls with the grid, above it (the genre and view controls). */
  header?: ReactElement;
}

/** The grid for one list; the caller owns the data (`useMangaList`). */
export function ListGrid({ list, query$, genre$, header }: ListGridProps) {
  const { current } = useBreakpoint();
  const { manga$, loading, refetching } = list;
  const headerScroll = useHeaderScroll();
  const manga = useValue(manga$);

  const numColumns = columnsFor(current, useValue(listView$.density));
  const titlePosition = toTitlePosition(useValue(listView$.title));

  if (loading && !refetching) {
    return <LoadingState />;
  }

  return (
    <LegendList
      recycleItems
      data={manga}
      numColumns={numColumns}
      // Recycled cells only redraw when this changes; the title mode lives in `renderItem`.
      extraData={titlePosition}
      keyExtractor={(item) => String(item.id)}
      // Spacing units, one gap for both axes (see `LegendList`). Titles under the
      // covers need air between rows; on the cover they don't.
      columnWrapperStyle={{ gap: titlePosition === "below" ? 4 : 2 }}
      contentContainerClassName="gutters px-gx md:pl-4 md:pr-gx pb-gb"
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <ListItem item={item} titlePosition={titlePosition} />
      )}
      ListEmptyComponent={<ListEmpty genre$={genre$} query$={query$} />}
      {...headerScroll}
    />
  );
}
