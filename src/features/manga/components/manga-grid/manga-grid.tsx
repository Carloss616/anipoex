import type { Selector } from "@legendapp/state";
import { cn } from "panelui-native/utils/cn";
import type { ReactElement } from "react";
import { LinearTransition } from "react-native-reanimated";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import type { useScrollSync } from "@/hooks/use-scroll-sync";
import { GridItem } from "./grid-item";
import { useGridData } from "./hooks/use-grid-data";

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
  /** @platform web */
  className?: string;
  /**
   * Stays drawn while a sheet route covers its screen.
   * @platform web
   */
  visibleWhenBlurred?: boolean;
  /**
   * Scrolls together with another scroller of the same key (a sidebar).
   * @platform web
   */
  scrollSync?: ReturnType<typeof useScrollSync>;
}

/** A grid of manga cards, in the list's density and title position. */
export function MangaGrid({
  manga$,
  loading,
  empty,
  header,
  scrollKey,
  onEndReached,
  className,
  visibleWhenBlurred,
  scrollSync,
}: MangaGridProps) {
  const headerScroll = useHeaderScroll();
  const {
    manga,
    settling,
    columns: numColumns,
    titlePosition,
    listKey,
  } = useGridData(manga$, scrollKey);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <LegendList
      key={listKey}
      recycleItems
      itemLayoutAnimation={LinearTransition}
      visibleWhenBlurred={visibleWhenBlurred}
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
        "[&_[style*=contain]:hover]:z-1 [&_[style*=contain]:hover]:contain-[layout_style]!",
        className,
      )}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <GridItem item={item} titlePosition={titlePosition} />
      )}
      ListEmptyComponent={settling ? undefined : empty}
      onEndReached={onEndReached}
      {...headerScroll}
      refScrollView={scrollSync?.ref}
      onScroll={(event) => {
        headerScroll.onScroll?.(event);
        scrollSync?.onScroll?.(event);
      }}
      onScrollBeginDrag={scrollSync?.setActive}
    />
  );
}
