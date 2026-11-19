import { useValue } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { useMemo } from "react";
import { View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import { ActiveFilters } from "@/components/blocks/active-filters";
import { EmptyState } from "@/components/blocks/empty-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { LegendList } from "@/components/layout/legend-list";
import { downloadsPending } from "@/features/activity/utils/state";
import { downloadsPaused$ } from "@/features/downloads";
import { askToNotify } from "@/features/manga/utils/scan-activity";
import type { TargetKey } from "@/features/sync/state/engine";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { ActivityToolbar } from "./components/activity-toolbar";
import { DownloadItem } from "./components/download-item";
import { EntryItem } from "./components/entry-item";
import { FilterSidebar } from "./components/filter-sidebar";
import { QueueItem } from "./components/queue-item";
import { RunningItem } from "./components/running-item";
import { SkippedItem } from "./components/skipped-item";
import { StatusCard } from "./components/status-card";
import { SyncItem } from "./components/sync-item";
import { UnsentItem } from "./components/unsent-item";
import { useActivityIds } from "./hooks/use-activity-ids";
import { startReadingScan } from "./utils/actions";
import {
  type ActivityFilter,
  type ActivityRow,
  type ActivitySection,
  countsOf,
  emptyKind,
  FILTER_TITLES,
  headerIndices,
  parseFilter,
  toRows,
} from "./utils/filters";
import { headerActions } from "./utils/header-actions";
import { SECTION_DESCRIPTIONS, sectionTitle } from "./utils/section-header";
import { downloadsFailed } from "./utils/state";
import { statusMode } from "./utils/status-mode";

const ALL_CAUGHT_UP = {
  title: "All caught up",
  description: "Scans, downloads and changes waiting to be sent show up here.",
  actions: [
    {
      label: "Scan Reading",
      onPress: () => {
        askToNotify();
        startReadingScan();
      },
    },
  ],
};

/** Everything that runs or waits: scans, downloads, AniList changes, sync. */
export function Activity() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const ids = useActivityIds();
  const mode = useValue(statusMode);
  const headerScroll = useHeaderScroll();
  const headerHeight = useHeaderHeight();
  const wide = useBreakpoint().isAtLeast("md");

  const filter = parseFilter(params.filter);
  const counts = useMemo(() => countsOf(ids), [ids]);
  const rows = useMemo(() => toRows(ids, filter), [ids, filter]);
  const stickyIndices = useMemo(() => headerIndices(rows), [rows]);
  const empty = emptyKind(ids, filter, mode !== "");

  // `all` is the default: keep it out of the URL.
  const setFilter = (f: ActivityFilter) =>
    router.setParams({ filter: f === "all" ? undefined : f });

  return (
    <>
      <Stack.Title>Activity</Stack.Title>
      <ActivityToolbar
        counts={counts}
        filter={filter}
        onFilterChange={setFilter}
      />
      <View className="flex-1 flex-row">
        {wide && (
          <HeaderInsetView className="gutters pb-gb pl-gx box-content w-48 pr-4">
            <FilterSidebar
              filter={filter}
              counts={counts}
              onSelect={setFilter}
              className="pt-4"
            />
          </HeaderInsetView>
        )}
        <View className="flex-1">
          <LegendList
            itemLayoutAnimation={LinearTransition}
            data={rows}
            keyExtractor={(row) => row.key}
            getItemType={(row) =>
              row.kind === "header" ? "header" : row.section
            }
            stickyHeaderConfig={{ offset: headerHeight }}
            stickyHeaderIndices={stickyIndices}
            {...headerScroll}
            contentContainerClassName="gutters pb-gb"
            ListHeaderComponent={
              <HeaderInsetView>
                <View className="px-gx gap-3 py-4 md:pl-4">
                  {mode !== "" && <StatusCard mode={mode} />}
                  {!wide && filter !== "all" && (
                    <View className="flex-row flex-wrap items-center gap-3">
                      <ActiveFilters
                        filters={[
                          {
                            label: FILTER_TITLES[filter],
                            clear: () => setFilter("all"),
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </HeaderInsetView>
            }
            ListEmptyComponent={
              empty === "all" ? (
                <EmptyState {...ALL_CAUGHT_UP} />
              ) : (
                <EmptyState title="Nothing here" />
              )
            }
            renderItem={({ item: row }) =>
              row.kind === "header" ? (
                <SectionHeader section={row.section} count={row.count} />
              ) : (
                <Frame
                  className={cn(
                    "gutters mx-gx rounded-t-none border-t-0 md:ml-4",
                    row.index === row.count - 1
                      ? "mb-4"
                      : "rounded-b-none border-b-0",
                  )}
                >
                  <Frame.Panel
                    data-attached="column"
                    className={cn(row.index > 0 && "rounded-t-none!")}
                  >
                    <SectionItem row={row} />
                  </Frame.Panel>
                </Frame>
              )
            }
          />
        </View>
      </View>
    </>
  );
}

function SectionItem({ row }: { row: Extract<ActivityRow, { kind: "item" }> }) {
  switch (row.section) {
    case "running":
      return <RunningItem mangaId={row.id} />;
    case "queue":
      return <QueueItem id={row.id} />;
    case "downloads":
      return <DownloadItem id={row.id} />;
    case "skipped":
      return <SkippedItem sourceId={row.id} />;
    case "entries":
      return <EntryItem id={row.id} />;
    case "unsent":
      return <UnsentItem id={row.id} />;
    case "sync":
      return <SyncItem id={row.id as TargetKey} />;
  }
}

/** The top of its section's card; pinned, a glass pill over the rows. */
function SectionHeader({
  section,
  count,
}: {
  section: ActivitySection;
  count: number;
}) {
  const paused = useValue(downloadsPaused$);
  const pending = useValue(downloadsPending);
  const failed = useValue(downloadsFailed);
  const description = SECTION_DESCRIPTIONS[section];
  const actions = headerActions(section, { paused, pending, failed });

  return (
    <Frame
      className={cn(
        "gutters mx-gx rounded-b-none border-b-0 md:ml-4",
        "stuck:glass-chrome! stuck:glass-muted stuck:rounded-full stuck:border stuck:shadow-lg",
      )}
    >
      <Frame.Header>
        <Frame.Title>{sectionTitle(section, count)}</Frame.Title>
        {description && <Frame.Description>{description}</Frame.Description>}
        {actions.length > 0 && (
          <Frame.Action className="flex flex-row items-center gap-1">
            {actions.map(({ label, onPress }) => (
              <Button key={label} variant="ghost" size="sm" onClick={onPress}>
                {label}
              </Button>
            ))}
          </Frame.Action>
        )}
      </Frame.Header>
    </Frame>
  );
}
