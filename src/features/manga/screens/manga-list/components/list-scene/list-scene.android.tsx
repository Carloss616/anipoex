import { useApolloClient } from "@apollo/client/react";
import { PullToRefreshBox } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useWindowDimensions } from "react-native";
import { Center } from "@/components/layout/center";
import { LazyColumn } from "@/components/layout/lazy-column";
import { Row } from "@/components/layout/row";
import { EnsureHost, EnsureRNHostView } from "@/components/ui/host";
import { Loader } from "@/components/ui/loader";
import { listView$ } from "@/features/manga/state/list-view";
import { columnsFor, toTitlePosition } from "@/features/manga/utils/list-view";
import { ListEmpty } from "../list-empty";
import { ListItem, useItemWidth } from "../list-item";
import { toRows } from "./grid";
import type { ListSceneProps } from "./list-scene";

const ROW = "gap-2 px-safe-offset-gx";

/**
 * One Host for the whole grid (a Host per card made scrolling crawl), or the
 * pager's when it sits in one. @expo/ui has no lazy grid, so rows go down a
 * `LazyColumn`.
 */
export function ListScene({ list, query$, genre$, header }: ListSceneProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const { manga$, loading, refetching, refetch } = list;
  const manga = useValue(manga$);
  const client = useApolloClient();

  const columns = columnsFor(current, useValue(listView$.density));
  const titlePosition = toTitlePosition(useValue(listView$.title));
  const cell = useItemWidth(ROW, columns, width);
  const rows = toRows(manga, columns);

  if (loading && !refetching) {
    return (
      // An RN view: inside the pager's Host it needs its own boundary.
      <EnsureRNHostView className="flex-1">
        <Center>
          <Loader variant="morph-ring" speed={3} size="lg" />
        </Center>
      </EnsureRNHostView>
    );
  }

  return (
    // Reuses the pager's Host when it sits in one.
    <EnsureHost className="flex-1">
      <PullToRefreshBox
        isRefreshing={refetching}
        // The app bar has no Refresh on Android: this one redoes the counts too.
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
          modifiers={[fillMaxSize()]}
          className={titlePosition === "below" ? "gap-5 pb-gb" : "gap-2 pb-gb"}
        >
          {header}
          <LazyColumn.Items
            data={rows}
            keyExtractor={(row) => row.map((m) => m.id).join()}
            // Two lines of title and the caption sit under the cover when `below`.
            estimatedItemSize={
              cell * 1.5 + (titlePosition === "below" ? 68 : 0)
            }
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
    </EnsureHost>
  );
}
