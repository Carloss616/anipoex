import { useApolloClient } from "@apollo/client/react";
import { PullToRefreshBox } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { useWindowDimensions } from "react-native";
import { Center } from "@/components/layout/center";
import { LazyColumn } from "@/components/layout/lazy-column";
import { Row } from "@/components/layout/row";
import { Loader } from "@/components/ui/loader";
import { ALL } from "@/features/manga/hooks/use-manga-list";
import { listView$ } from "@/features/manga/state/list-view";
import { columnsFor, toTitlePosition } from "@/features/manga/utils/list-view";
import { ListEmpty } from "../list-empty";
import { ListItem, useItemWidth } from "../list-item";
import { toRows } from "./grid";
import type { ListGridProps } from "./list-grid";

const ROW = "gap-2 px-safe-offset-gx";

/**
 * Renders inside the pager's Host: one for the whole grid (a Host per card made
 * scrolling crawl). @expo/ui has no lazy grid, so rows go down a `LazyColumn`.
 */
export function ListGrid({ list, query$, genre$, header }: ListGridProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const { manga$, loading, refetching, refetch } = list;
  const manga = useValue(manga$);
  const genre = useValue(genre$);
  const client = useApolloClient();

  const columns = columnsFor(current, useValue(listView$.density));
  const titlePosition = toTitlePosition(useValue(listView$.title));
  const cell = useItemWidth(ROW, columns, width);
  const rows = toRows(manga, columns);

  if (loading && !refetching) {
    return (
      <Center>
        <Loader variant="morph-ring" speed={3} size="lg" />
      </Center>
    );
  }

  return (
    <PullToRefreshBox
      isRefreshing={refetching}
      onRefresh={() =>
        void Promise.all([
          refetch(),
          client.refetchQueries({ include: ["MangaListCounts"] }),
        ])
      }
      contentAlignment="topCenter"
      modifiers={[fillMaxSize()]}
    >
      <LazyColumn
        // Remount per genre, or the chip lands above Compose's kept scroll.
        key={genre}
        modifiers={[fillMaxSize()]}
        className={cn(
          "pb-gb",
          genre === ALL ? "pt-gt" : titlePosition === "below" ? "pt-5" : "pt-2",
          titlePosition === "below" ? "gap-5" : "gap-2",
        )}
      >
        {header}
        <LazyColumn.Items
          data={rows}
          keyExtractor={(row) => row.map((m) => m.id).join()}
          // Two lines of title and the caption sit under the cover when `below`.
          estimatedItemSize={cell * 1.5 + (titlePosition === "below" ? 68 : 0)}
        >
          {({ item: row }) => (
            <Row className={ROW}>
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
