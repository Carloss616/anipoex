import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import type { ReactElement } from "react";
import { LinearTransition } from "react-native-reanimated";
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
      itemLayoutAnimation={LinearTransition}
      data={manga}
      numColumns={numColumns}
      // Recycled cells only redraw when this changes; the title mode lives in `renderItem`.
      extraData={titlePosition}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={{ gap: titlePosition === "below" ? 16 : 8 }}
      // A hovered cell drops its paint containment and rises, so the card's glow and lean aren't clipped.
      contentContainerClassName={cn(
        "gutters px-gx pb-gb md:pr-gx md:pl-4",
        "[&_[style*=contain]:hover]:z-1 [&_[style*=contain]:hover]:contain-[layout_style]!",
      )}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <ListItem item={item} titlePosition={titlePosition} />
      )}
      ListEmptyComponent={<ListEmpty genre$={genre$} query$={query$} />}
      {...headerScroll}
    />
  );
}
