import { PullToRefreshBox } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useWindowDimensions } from "react-native";
import { Center } from "@/components/layout/center";
import { LazyColumn } from "@/components/layout/lazy-column";
import { Row } from "@/components/layout/row";
import { Host } from "@/components/ui/host";
import { Loader } from "@/components/ui/loader";
import { useMangaList } from "@/features/manga/hooks/use-manga-list";
import { ListEmpty } from "../list-empty";
import { ListHeader } from "../list-header";
import { ListItem, useItemWidth } from "../list-item";
import { COLUMNS, toRows } from "./grid";
import type { ListSceneProps } from "./list-scene";

const ROW = "gap-2 px-safe-offset-gx";

/**
 * One Host for the whole grid (a Host per card made scrolling crawl). @expo/ui
 * has no lazy grid, so rows go down a `LazyColumn`.
 */
export function ListScene({ status, query$, counts$ }: ListSceneProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const { manga$, genres$, genre$, loading, refetching, refetch } =
    useMangaList(status, query$, counts$);
  const manga = useValue(manga$);

  const columns = COLUMNS[current];
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
    <Host className="flex-1">
      <PullToRefreshBox
        isRefreshing={refetching}
        onRefresh={() => void refetch()}
        contentAlignment="topCenter"
        modifiers={[fillMaxSize()]}
      >
        <LazyColumn modifiers={[fillMaxSize()]} className="gap-2 pb-gb">
          <ListHeader genre$={genre$} genres$={genres$} />
          {rows.length === 0 && <ListEmpty genre$={genre$} query$={query$} />}
          <LazyColumn.Items
            data={rows}
            keyExtractor={(row) => row.map((m) => m.id).join()}
            estimatedItemSize={cell * 1.5}
          >
            {({ item: row }) => (
              <Row className={ROW}>
                {row.map((item) => (
                  <ListItem key={item.id} item={item} width={cell} />
                ))}
              </Row>
            )}
          </LazyColumn.Items>
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
