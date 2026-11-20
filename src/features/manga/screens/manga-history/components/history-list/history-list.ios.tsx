import { List, Section } from "@expo/ui/swift-ui";
import {
  listRowBackground,
  listStyle,
  refreshable,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo, useMemo } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import type { HistoryActivityFragment } from "@/features/manga/graphql/manga-history.generated";
import { useThemeColor } from "@/hooks/use-theme-color";
import { daySections } from "../../utils/history-rows";
import { filterBy } from "../../utils/row-menu";
import { FilterCard } from "../filter-card";
import { HistoryRow } from "../history-row";
import { ListFooter } from "../list-footer";
import { PendingRows } from "../pending-rows";
import type { HistoryListProps } from "./history-list";

/** A section per day, as the Activity screen groups its rows. */
export function HistoryList({ history, mediaId }: HistoryListProps) {
  const rows = useValue(history.rows$);
  const sections = useMemo(() => daySections(rows), [rows]);
  const filtered = mediaId != null;
  const font = useFont();

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
      <List
        modifiers={[
          listStyle("insetGrouped"),
          scrollContentBackground("hidden"),
          refreshable(history.refresh),
          font,
        ]}
      >
        {filtered && <FilterCard mediaId={mediaId} />}
        <PendingRows mediaId={mediaId} />
        {sections.map(({ key, label, activities }) => (
          <DaySection
            key={key}
            label={label}
            activities={activities}
            filtered={filtered}
          />
        ))}
        <Section modifiers={[listRowBackground("clear")]}>
          <ListFooter
            key={String(history.busy)}
            loadingMore={history.loadingMore}
            moreFailed={history.moreFailed}
            ended={!history.hasMore}
            onLoadMore={history.loadMore}
          />
        </Section>
      </List>
    </Host>
  );
}

const DaySection = memo(function DaySection({
  label,
  activities,
  filtered,
}: {
  label: string;
  activities: HistoryActivityFragment[];
  filtered: boolean;
}) {
  const rowBackground = listRowBackground(useThemeColor("surface-secondary"));

  return (
    <Section title={label} modifiers={[rowBackground]}>
      <List.ForEach
        data={activities}
        keyExtractor={(a) => String(a.id)}
        recycling={false}
      >
        {({ item }) => <HistoryRow activity={item} filtered={filtered} />}
      </List.ForEach>
    </Section>
  );
});
