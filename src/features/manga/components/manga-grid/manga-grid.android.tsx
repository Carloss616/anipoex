import {
  Box,
  LazyColumn,
  PullToRefreshBox,
  Row,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  onVisibilityChanged,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState } from "@/components/blocks/loading-state";
import { GUTTER } from "@/components/native/constants";
import { Loader } from "@/components/ui/loader";
import { columnsFor } from "@/features/manga/utils/list-view";
import { settings$ } from "@/state/settings";
import { GridItem } from "./grid-item";
import type { MangaGridProps } from "./manga-grid";
import { cellWidth, toRows } from "./utils";

/** Between the cards of a row. */
const GAP = 8;

/**
 * Renders inside the screen's Host: one for the whole grid, as a Host per card
 * made scrolling crawl. @expo/ui has no lazy grid: rows go down a `LazyColumn`.
 */
export function MangaGrid({
  manga$,
  loading,
  empty,
  header,
  scrollKey,
  onRefresh,
  refreshing = false,
  onEndReached,
}: MangaGridProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const manga = useValue(manga$);

  const columns = columnsFor(current, useValue(settings$.mangaList.density));
  const titlePosition = useValue(settings$.mangaList.title);
  const start = GUTTER + insets.left;
  const end = GUTTER + insets.right;
  const cell = cellWidth(width - start - end, columns, GAP);
  const below = titlePosition !== "over";
  const rows = toRows(manga, columns);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <PullToRefreshBox
      isRefreshing={refreshing}
      // The error link toasts a failure; this stops an unhandled rejection.
      onRefresh={() => void onRefresh?.().catch(() => {})}
      contentAlignment="topCenter"
      modifiers={[fillMaxSize()]}
    >
      <LazyColumn
        key={scrollKey}
        modifiers={[fillMaxSize()]}
        verticalArrangement={{ spacedBy: below ? 20 : 8 }}
        contentPadding={{
          top: 8,
          bottom: GUTTER,
        }}
      >
        {header}
        <LazyColumn.Items
          data={rows}
          keyExtractor={(row) => row.map((m) => m.id).join()}
          // `below` puts two title lines and the caption under the cover.
          estimatedItemSize={cell * 1.5 + (below ? 68 : 0)}
        >
          {({ item: row }) => (
            <Row
              verticalAlignment="top"
              horizontalArrangement={{ spacedBy: GAP }}
              modifiers={[padding(start, 0, end, 0)]}
            >
              {row.map((item) => (
                <GridItem
                  key={item.id}
                  item={item}
                  titlePosition={titlePosition}
                  width={cell}
                />
              ))}
            </Row>
          )}
        </LazyColumn.Items>
        {onEndReached && rows.length > 0 && (
          // Loads the next page as it scrolls into view.
          <Box
            contentAlignment="center"
            modifiers={[
              fillMaxWidth(),
              onVisibilityChanged((visible) => visible && onEndReached()),
            ]}
          >
            <Loader />
          </Box>
        )}
      </LazyColumn>
      {/* Over the list, not in it: a lazy item has no height to fill. */}
      {rows.length === 0 && empty}
    </PullToRefreshBox>
  );
}
