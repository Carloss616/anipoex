import { useApolloClient } from "@apollo/client/react";
import { HStack, LazyVStack, ScrollView, ZStack } from "@expo/ui/swift-ui";
import { padding, refreshable } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState } from "@/components/loading-state";
import { GUTTER_BOTTOM, GUTTER_X } from "@/components/native/constants";
import { listView$ } from "@/features/manga/state/list-view";
import { columnsFor, toTitlePosition } from "@/features/manga/utils/list-view";
import { ListEmpty } from "../list-empty";
import { ListItem } from "../list-item";
import { cellWidth, toRows } from "./grid";
import type { ListGridProps } from "./list-grid";

/** Between the cards of a row. */
const GAP = 8;

/** Renders inside the screen's Host, which stacks it under the view sheet. */
export function ListGrid({ list, query$, genre$, header }: ListGridProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { manga$, loading, refetching, refetch } = list;
  const manga = useValue(manga$);
  const client = useApolloClient();

  const columns = columnsFor(current, useValue(listView$.density));
  const titlePosition = toTitlePosition(useValue(listView$.title));
  // The Host already insets the safe area.
  const cell = cellWidth(
    width - insets.left - insets.right - 2 * GUTTER_X,
    columns,
    GAP,
  );
  const rows = toRows(manga, columns);

  if (loading && !refetching) {
    return <LoadingState />;
  }

  return (
    // Keyed: re-parented covers miss their expo-image load; a fresh grid doesn't.
    <ZStack key={titlePosition}>
      <ScrollView
        modifiers={[
          refreshable(async () => {
            await Promise.all([
              refetch(),
              client.refetchQueries({ include: ["MangaListCounts"] }),
            ]);
          }),
        ]}
      >
        <LazyVStack
          alignment="leading"
          spacing={titlePosition === "below" ? 20 : 8}
          modifiers={[padding({ bottom: GUTTER_BOTTOM })]}
        >
          {header}
          <LazyVStack.ForEach
            data={rows}
            keyExtractor={(row) => row.map((m) => m.id).join()}
            // Two lines of title and the caption sit under the cover when `below`.
            estimatedItemSize={
              cell * 1.5 + (titlePosition === "below" ? 68 : 0)
            }
          >
            {({ item: row }) => (
              <HStack
                alignment="top"
                spacing={GAP}
                modifiers={[padding({ horizontal: GUTTER_X })]}
              >
                {row.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    width={cell}
                    titlePosition={titlePosition}
                  />
                ))}
              </HStack>
            )}
          </LazyVStack.ForEach>
        </LazyVStack>
      </ScrollView>
      {/* Over the grid, centred in the visible area; a lazy row can't fill it. */}
      {rows.length === 0 && <ListEmpty genre$={genre$} query$={query$} />}
    </ZStack>
  );
}
