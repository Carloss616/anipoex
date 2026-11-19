import { List } from "@expo/ui/swift-ui";
import { listStyle, refreshable } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { Host } from "@/components/ui/host";
import { filterBy } from "../../utils/row-menu";
import { DayRow } from "../day-row";
import { FilterCard } from "../filter-card";
import { HistoryRow } from "../history-row";
import { ListFooter } from "../list-footer";
import { PendingRows } from "../pending-rows";
import type { HistoryListProps } from "./history-list";

/** One recycled `ForEach` of day and activity rows; the day isn't pinned. */
export function HistoryList({ history, mediaId }: HistoryListProps) {
  const rows = useValue(history.rows$);
  const filtered = mediaId != null;

  if (rows.length === 0) {
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
    <Host className="flex-1">
      <List modifiers={[listStyle("plain"), refreshable(history.refresh)]}>
        {filtered && <FilterCard mediaId={mediaId} />}
        <PendingRows mediaId={mediaId} />
        <List.ForEach data={rows} keyExtractor={(row) => row.key}>
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
        </List.ForEach>
        <ListFooter
          key={String(history.busy)}
          loadingMore={history.loadingMore}
          moreFailed={history.moreFailed}
          ended={!history.hasMore}
          onLoadMore={history.loadMore}
        />
      </List>
    </Host>
  );
}
