import { HStack, LazyVStack, ScrollView, ZStack } from "@expo/ui/swift-ui";
import {
  frame,
  onAppear,
  padding,
  refreshable,
} from "@expo/ui/swift-ui/modifiers";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState } from "@/components/blocks/loading-state";
import { GUTTER } from "@/components/native/constants";
import { Loader } from "@/components/ui/loader";
import { OVERSCAN_ROWS } from "./constants";
import { GridItem } from "./grid-item";
import { useGridData } from "./hooks/use-grid-data";
import type { MangaGridProps } from "./manga-grid";
import { cellWidth, toRows } from "./utils";

/** Between the cards of a row. */
const GAP = 8;

/** Renders inside the screen's Host. */
export function MangaGrid({
  manga$,
  loading,
  empty,
  header,
  scrollKey,
  onRefresh,
  onEndReached,
}: MangaGridProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { manga, settling, columns, titlePosition, listKey } = useGridData(
    manga$,
    scrollKey,
  );
  // The Host already insets the safe area.
  const cell = cellWidth(
    width - insets.left - insets.right - 2 * GUTTER,
    columns,
    GAP,
  );
  const rows = toRows(manga, columns);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ZStack>
      <ScrollView
        key={listKey}
        modifiers={
          onRefresh
            ? // The error link toasts a failure; this just stops an unhandled
              // rejection.
              [
                refreshable(async () => {
                  await onRefresh().catch(() => {});
                }),
              ]
            : []
        }
      >
        <LazyVStack
          alignment="leading"
          spacing={titlePosition !== "over" ? 20 : 8}
          modifiers={[padding({ bottom: GUTTER })]}
        >
          {header}
          <LazyVStack.ForEach
            data={rows}
            keyExtractor={(row) => row.map((m) => m.id).join()}
            overscanCount={OVERSCAN_ROWS}
            // `below` puts two title lines and the caption under the cover.
            estimatedItemSize={cell * 1.5 + (titlePosition !== "over" ? 68 : 0)}
          >
            {({ item: row }) => (
              <HStack
                alignment="top"
                spacing={GAP}
                modifiers={[padding({ horizontal: GUTTER })]}
              >
                {row.map((item) => (
                  <GridItem
                    key={item.id}
                    item={item}
                    titlePosition={titlePosition}
                    width={cell}
                  />
                ))}
              </HStack>
            )}
          </LazyVStack.ForEach>
          {onEndReached && rows.length > 0 && (
            // Loads the next page as it scrolls into view.
            <HStack
              modifiers={[
                frame({ maxWidth: Infinity }),
                onAppear(onEndReached),
              ]}
            >
              <Loader />
            </HStack>
          )}
        </LazyVStack>
      </ScrollView>
      {/* Over the grid, centred in view; a lazy row can't fill it. */}
      {rows.length === 0 && !settling && empty}
    </ZStack>
  );
}
