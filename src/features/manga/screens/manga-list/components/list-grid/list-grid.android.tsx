import { useApolloClient } from "@apollo/client/react";
import { LazyColumn, PullToRefreshBox, Row } from "@expo/ui/jetpack-compose";
import { fillMaxSize, padding } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState } from "@/components/blocks/loading-state";
import { GUTTER } from "@/components/native/constants";
import { listView$ } from "@/features/manga/state/list-view";
import { columnsFor, toTitlePosition } from "@/features/manga/utils/list-view";
import { ListEmpty } from "../list-empty";
import { ListItem } from "../list-item";
import type { ListGridProps } from "./list-grid";
import { cellWidth, toRows } from "./utils";

/** Between the cards of a row. */
const GAP = 8;

/**
 * Renders inside the pager's Host: one for the whole grid (a Host per card made
 * scrolling crawl). @expo/ui has no lazy grid, so rows go down a `LazyColumn`.
 */
export function ListGrid({ list, query$, genre$, header }: ListGridProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { manga$, loading, refetching, refetch } = list;
  const manga = useValue(manga$);
  const genre = useValue(genre$);
  const client = useApolloClient();

  const columns = columnsFor(current, useValue(listView$.density));
  const titlePosition = toTitlePosition(useValue(listView$.title));
  const start = GUTTER + insets.left;
  const end = GUTTER + insets.right;
  const cell = cellWidth(width - start - end, columns, GAP);
  const below = titlePosition === "below";
  const rows = toRows(manga, columns);

  if (loading && !refetching) {
    return <LoadingState />;
  }

  return (
    <PullToRefreshBox
      isRefreshing={refetching}
      onRefresh={() =>
        void Promise.all([
          refetch(),
          client.refetchQueries({ include: ["MangaListCounts"] }),
          // The error link toasts it; this just stops an unhandled rejection.
        ]).catch(() => {})
      }
      contentAlignment="topCenter"
      modifiers={[fillMaxSize()]}
    >
      <LazyColumn
        // Remount per genre: a new filter starts at the top, not at the kept scroll.
        key={genre}
        modifiers={[fillMaxSize()]}
        verticalArrangement={{ spacedBy: below ? 20 : 8 }}
        contentPadding={{
          // The genre chips come first, right under the tabs.
          top: 8,
          bottom: GUTTER,
        }}
      >
        {header}
        <LazyColumn.Items
          data={rows}
          keyExtractor={(row) => row.map((m) => m.id).join()}
          // `below` puts two title lines and the caption under the cover.
          estimatedItemSize={cell * 1.5 + (titlePosition === "below" ? 68 : 0)}
        >
          {({ item: row }) => (
            <Row
              verticalAlignment="top"
              horizontalArrangement={{ spacedBy: GAP }}
              modifiers={[padding(start, 0, end, 0)]}
            >
              {row.map((item) => (
                <ListItem
                  key={item.id}
                  item={item}
                  width={cell}
                  titlePosition={titlePosition}
                />
              ))}
            </Row>
          )}
        </LazyColumn.Items>
      </LazyColumn>
      {/* Over the list, not in it: a lazy item has no height to fill. */}
      {rows.length === 0 && <ListEmpty genre$={genre$} query$={query$} />}
    </PullToRefreshBox>
  );
}
