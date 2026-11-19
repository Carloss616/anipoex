import { useValue } from "@legendapp/state/react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useMemo } from "react";
import { View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { LegendList } from "@/components/layout/legend-list";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import type { useMangaHistory } from "../../hooks/use-manga-history";
import { DayRow } from "../day-row";
import { FilterCard } from "../filter-card";
import { HistoryRow } from "../history-row";
import { ListFooter } from "../list-footer";
import { PendingRows } from "../pending-rows";

export interface HistoryListProps {
  history: ReturnType<typeof useMangaHistory>;
  /** The manga the list is narrowed to. */
  mediaId: number | undefined;
}

/** The activity by day, the next page loading as it reaches the end. */
export function HistoryList({ history, mediaId }: HistoryListProps) {
  const rows = useValue(history.rows$);
  const headerScroll = useHeaderScroll();
  const headerHeight = useHeaderHeight();
  const stickyIndices = useMemo(
    () => rows.flatMap((row, i) => (row.type === "day" ? [i] : [])),
    [rows],
  );
  const filtered = mediaId != null;

  return (
    <LegendList
      recycleItems
      itemLayoutAnimation={LinearTransition}
      data={rows}
      keyExtractor={(row) => row.key}
      getItemType={(row) => row.type}
      estimatedItemSize={66}
      stickyHeaderConfig={{ offset: headerHeight }}
      stickyHeaderIndices={stickyIndices}
      {...headerScroll}
      contentContainerClassName="gutters pb-gb"
      onEndReached={history.moreFailed ? undefined : history.loadMore}
      ListHeaderComponent={
        <HeaderInsetView>
          <View className="pt-4">
            {mediaId != null && <FilterCard mediaId={mediaId} />}
            <PendingRows mediaId={mediaId} />
          </View>
        </HeaderInsetView>
      }
      ListEmptyComponent={
        history.loading ? (
          <LoadingState />
        ) : history.error ? (
          <EmptyState
            title="Couldn't load your history"
            actions={[{ label: "Retry", onPress: history.refresh }]}
          />
        ) : (
          <EmptyState
            title={filtered ? "No activity for this manga" : "No activity yet"}
            description="What you read and add to your lists shows here."
          />
        )
      }
      ListFooterComponent={
        rows.length > 0 ? (
          <ListFooter
            loadingMore={history.loadingMore}
            moreFailed={history.moreFailed}
            ended={!history.hasMore}
            onLoadMore={history.loadMore}
          />
        ) : null
      }
      renderItem={({ item: row }) =>
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
    />
  );
}
