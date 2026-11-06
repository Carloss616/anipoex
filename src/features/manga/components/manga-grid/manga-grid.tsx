import type { Selector } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import type { ReactElement } from "react";
import { LinearTransition } from "react-native-reanimated";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import { listView$ } from "@/features/manga/state/list-view";
import { columnsFor, toTitlePosition } from "@/features/manga/utils/list-view";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { GridItem } from "./grid-item";

export interface MangaGridProps {
  manga$: Selector<MangaEntry[]>;
  /** The first load: a loader in place of the grid. */
  loading: boolean;
  /** Shown when `manga$` is empty. */
  empty: ReactElement;
  /** Scrolls with the grid, above it. */
  header?: ReactElement;
  /** A new key remounts the scroller, so a new filter starts at the top. */
  scrollKey?: string;
  /**
   * Pull to refresh.
   * @platform ios
   * @platform android
   */
  onRefresh?: () => Promise<unknown>;
  /**
   * The refresh indicator.
   * @platform android
   */
  refreshing?: boolean;
  /** Near the end: load the next page. */
  onEndReached?: () => void;
}

/** A grid of manga cards, in the list's density and title position. */
export function MangaGrid({
  manga$,
  loading,
  empty,
  header,
  scrollKey,
  onEndReached,
}: MangaGridProps) {
  const { current } = useBreakpoint();
  const headerScroll = useHeaderScroll();
  const manga = useValue(manga$);

  const numColumns = columnsFor(current, useValue(listView$.density));
  const titlePosition = toTitlePosition(useValue(listView$.title));

  if (loading) {
    return <LoadingState />;
  }

  return (
    <LegendList
      key={scrollKey}
      recycleItems
      itemLayoutAnimation={LinearTransition}
      data={manga}
      numColumns={numColumns}
      // Recycled cells only redraw when this changes; the title mode lives in
      // `renderItem`.
      extraData={titlePosition}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={{ gap: titlePosition !== "over" ? 16 : 8 }}
      // A hovered cell drops its paint containment and rises, so the card's
      // glow and lean aren't clipped.
      contentContainerClassName={cn(
        "gutters px-gx pb-gb md:pr-gx md:pl-4",
        "[&_[style*=contain]:hover]:z-1 [&_[style*=contain]:hover]:contain-[layout_style]!",
      )}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <GridItem item={item} titlePosition={titlePosition} />
      )}
      ListEmptyComponent={empty}
      onEndReached={onEndReached}
      {...headerScroll}
    />
  );
}
