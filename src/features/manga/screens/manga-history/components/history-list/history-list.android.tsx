import { Box, LazyColumn, PullToRefreshBox } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { Host } from "@/components/ui/host";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { filterBy } from "../../utils/row-menu";
import { DayRow } from "../day-row";
import { FilterCard } from "../filter-card";
import { HistoryRow } from "../history-row";
import { ListFooter } from "../list-footer";
import { PendingRows } from "../pending-rows";
import type { HistoryListProps } from "./history-list";

/** Rows are light, but each holds a Glide image: few past each edge. */
const OVERSCAN = 4;

/** Day labels and segmented groups in one recycled `LazyColumn`; pull to refresh. */
export function HistoryList({ history, mediaId }: HistoryListProps) {
  const rows = useValue(history.rows$);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const setHeaderScrolled = useSetHeaderScrolled();
  const [refreshing, setRefreshing] = useState(false);
  const filtered = mediaId != null;
  const empty = rows.length === 0;

  // The scroll behavior leaves with the list: with nothing to scroll, the
  // header rests.
  useEffect(() => {
    if (empty) setHeaderScrolled(false);
  }, [empty, setHeaderScrolled]);

  if (empty) {
    if (history.loading) return <LoadingState />;
    if (history.error)
      return (
        <EmptyState
          title="Couldn't load your history"
          actions={[{ label: "Retry", onPress: () => void history.refresh() }]}
        />
      );
    return filtered ? (
      <EmptyState
        title="No activity for this manga"
        actions={[{ label: "Show all", onPress: () => filterBy(undefined) }]}
      />
    ) : (
      <EmptyState
        title="No activity yet"
        description="What you read and add to your lists shows here."
      />
    );
  }

  return (
    <Host className="flex-1" style={{ marginTop: headerHeight }}>
      <PullToRefreshBox
        isRefreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          void history.refresh().finally(() => setRefreshing(false));
        }}
        contentAlignment="topCenter"
        modifiers={[fillMaxSize()]}
      >
        <Box
          // Remount per filter, or Compose keeps the scroll on the old first key.
          key={String(mediaId)}
          modifiers={[fillMaxSize(), pinnedScrollBehavior(setHeaderScrolled)]}
        >
          <LazyColumn
            modifiers={[fillMaxSize()]}
            contentPadding={{ start: insets.left, end: insets.right }}
          >
            {filtered && <FilterCard mediaId={mediaId} />}
            <PendingRows mediaId={mediaId} />
            <LazyColumn.Items
              data={rows}
              keyExtractor={(row) => row.key}
              overscanCount={OVERSCAN}
            >
              {({ item: row }) =>
                row.type === "day" ? (
                  <DayRow label={row.label} />
                ) : (
                  <HistoryRow
                    activity={row.activity}
                    first={row.first}
                    last={row.last}
                    filtered={filtered}
                  />
                )
              }
            </LazyColumn.Items>
            <ListFooter
              key={String(history.busy)}
              loadingMore={history.loadingMore}
              moreFailed={history.moreFailed}
              ended={!history.hasMore}
              onLoadMore={history.loadMore}
            />
          </LazyColumn>
        </Box>
      </PullToRefreshBox>
    </Host>
  );
}
