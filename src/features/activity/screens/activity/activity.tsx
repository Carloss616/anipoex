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
import { FilterSidebar } from "@/features/activity/components/filter-sidebar";
import { useActivityIds } from "@/features/activity/hooks/use-activity-ids";
import {
  type ActivityFilter,
  type ActivitySection,
  countsOf,
  emptyKind,
  FILTER_TITLES,
  headerIndices,
  itemCount,
  parseFilter,
  toRows,
} from "@/features/activity/utils/filters";
import { downloadsPending } from "@/features/activity/utils/state";
import { downloadsPaused$ } from "@/features/downloads";
import { useSettingsSplit } from "@/features/settings/components/settings-shell";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { ActivityToolbar } from "./components/activity-toolbar";
import { SectionItem } from "./components/section-item";
import { StatusCard } from "./components/status-card";
import { ALL_CAUGHT_UP } from "./utils/all-caught-up";
import type { HeaderAction } from "./utils/download-actions";
import { headerActions, NO_DOWNLOADS } from "./utils/header-actions";
import { SECTION_DESCRIPTIONS, sectionTitle } from "./utils/section-header";
import { downloadsFailed } from "./utils/state";
import { statusMode } from "./utils/status-mode";

/** Everything that runs or waits: scans, downloads, AniList changes, sync. */
export function Activity() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const ids = useActivityIds();
  const mode = useValue(statusMode);
  const headerScroll = useHeaderScroll();
  const headerHeight = useHeaderHeight();
  const wide = useBreakpoint().isAtLeast("md");
  // Beside the Settings sidebar, which lists the filters under Activity.
  const split = useSettingsSplit();

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
        {wide && !split && (
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
                <View className="px-gx lg:pl-gx gap-3 py-4 md:pl-4">
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
                        total={itemCount(counts[filter])}
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
                row.section === "downloads" ? (
                  <DownloadsHeader count={row.count} />
                ) : (
                  <SectionHeader
                    section={row.section}
                    count={row.count}
                    actions={headerActions(row.section, NO_DOWNLOADS)}
                  />
                )
              ) : (
                <Frame
                  className={cn(
                    "gutters mx-gx lg:ml-gx rounded-t-none border-t-0 md:ml-4",
                    row.index === row.count - 1
                      ? "mb-4"
                      : "rounded-b-none border-b-0",
                  )}
                >
                  <Frame.Panel
                    data-attached="column"
                    className={cn(row.index > 0 && "rounded-t-none!")}
                  >
                    <SectionItem section={row.section} id={row.id} />
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

function DownloadsHeader({ count }: { count: number }) {
  const paused = useValue(downloadsPaused$);
  const pending = useValue(downloadsPending);
  const failed = useValue(downloadsFailed);

  return (
    <SectionHeader
      section="downloads"
      count={count}
      actions={headerActions("downloads", { paused, pending, failed })}
    />
  );
}

function SectionHeader({
  section,
  count,
  actions = [],
}: {
  section: ActivitySection;
  count: number;
  actions?: HeaderAction[];
}) {
  const description = SECTION_DESCRIPTIONS[section];

  return (
    <Frame
      className={cn(
        "gutters mx-gx lg:ml-gx rounded-b-none border-b-0 md:ml-4",
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
