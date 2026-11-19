import {
  Box,
  Column,
  LazyColumn,
  Row,
  Spacer,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect, useMemo } from "react";
import { ActiveFilters } from "@/components/blocks/active-filters";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { corners, downloadsPending } from "@/features/activity/utils/state";
import { downloadsPaused$ } from "@/features/downloads";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ActivityToolbar } from "./components/activity-toolbar";
import { SectionItem } from "./components/section-item";
import { StatusCard } from "./components/status-card";
import { useActivityIds } from "./hooks/use-activity-ids";
import { ALL_CAUGHT_UP } from "./utils/all-caught-up";
import type { HeaderAction } from "./utils/download-actions";
import {
  type ActivityFilter,
  type ActivityRow,
  type ActivitySection,
  countsOf,
  emptyKind,
  FILTER_TITLES,
  parseFilter,
  toRows,
} from "./utils/filters";
import { headerActions, NO_DOWNLOADS } from "./utils/header-actions";
import { SECTION_DESCRIPTIONS, sectionTitle } from "./utils/section-header";
import { downloadsFailed } from "./utils/state";
import { statusMode } from "./utils/status-mode";

const FOOTERS: Partial<Record<ActivitySection, string>> = {
  ...SECTION_DESCRIPTIONS,
  entries: "Long-press a change to discard it.",
};

/** Everything that runs or waits: scans, downloads, AniList changes, sync. */
export function Activity() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const ids = useActivityIds();
  const statusShown = useValue(() => statusMode() !== "");
  const setHeaderScrolled = useSetHeaderScrolled();

  const filter = parseFilter(params.filter);
  const counts = useMemo(() => countsOf(ids), [ids]);
  const rows = useMemo(() => toRows(ids, filter), [ids, filter]);
  const empty = emptyKind(ids, filter, statusShown);

  // `all` is the default: keep it out of the URL.
  const setFilter = (f: ActivityFilter) =>
    router.setParams({ filter: f === "all" ? undefined : f });

  // The scroll behavior leaves with the list: with nothing to scroll, the
  // header rests.
  useEffect(() => {
    if (empty === "all") setHeaderScrolled(false);
  }, [empty, setHeaderScrolled]);

  return (
    <>
      <Stack.Title>Activity</Stack.Title>
      <ActivityToolbar
        counts={counts}
        filter={filter}
        onFilterChange={setFilter}
      />
      {empty === "all" ? (
        <EmptyState {...ALL_CAUGHT_UP} />
      ) : (
        <ActivityList
          rows={rows}
          filter={filter}
          onClearFilter={() => setFilter("all")}
        />
      )}
    </>
  );
}

/** Takes only the rows: inside a Host, its re-render re-runs every row. */
function ActivityList({
  rows,
  filter,
  onClearFilter,
}: {
  rows: ActivityRow[];
  filter: ActivityFilter;
  onClearFilter: () => void;
}) {
  const headerHeight = useHeaderHeight();
  const setHeaderScrolled = useSetHeaderScrolled();
  const filters =
    filter === "all"
      ? []
      : [{ label: FILTER_TITLES[filter], clear: onClearFilter }];

  return (
    <Host className="flex-1" style={{ marginTop: headerHeight }}>
      <Box
        // Remount per filter, or Compose keeps the scroll on the old first
        // key; the scroll behavior starts over with it.
        key={filter}
        modifiers={[fillMaxSize(), pinnedScrollBehavior(setHeaderScrolled)]}
      >
        <LazyColumn
          modifiers={[fillMaxSize()]}
          contentPadding={{ top: 8, bottom: GUTTER }}
        >
          <StatusSection />
          <ActiveFilters filters={filters} />
          {rows.length === 0 && <EmptyState title="Nothing here" />}
          <LazyColumn.Items
            data={rows}
            keyExtractor={(row) => row.key}
            recycling={false}
          >
            {({ item: row }) =>
              row.kind === "header" ? (
                row.section === "downloads" ? (
                  <DownloadsLabel
                    title={sectionTitle("downloads", row.count)}
                  />
                ) : (
                  <Label
                    title={sectionTitle(row.section, row.count)}
                    actions={headerActions(row.section, NO_DOWNLOADS)}
                  />
                )
              ) : (
                <Column>
                  <SectionItem
                    section={row.section}
                    id={row.id}
                    {...corners(row.index, row.count)}
                  />
                  {row.index === row.count - 1 && (
                    <Footer section={row.section} />
                  )}
                </Column>
              )
            }
          </LazyColumn.Items>
        </LazyColumn>
      </Box>
    </Host>
  );
}

function StatusSection() {
  const mode = useValue(statusMode);
  if (mode === "") return null;

  return <StatusCard mode={mode} />;
}

function DownloadsLabel({ title }: { title: string }) {
  const paused = useValue(downloadsPaused$);
  const pending = useValue(downloadsPending);
  const failed = useValue(downloadsFailed);

  return (
    <Label
      title={title}
      actions={headerActions("downloads", { paused, pending, failed })}
    />
  );
}

function Label({ title, actions }: { title: string; actions: HeaderAction[] }) {
  const m3 = useThemeM3Colors();

  return (
    <Row
      verticalAlignment="center"
      modifiers={[fillMaxWidth(), padding(GUTTER + 4, 16, GUTTER - 8, 4)]}
    >
      <Text style={{ typography: "labelLarge" }} color={m3.primary}>
        {title}
      </Text>
      <Spacer modifiers={[weight(1)]} />
      {actions.map(({ label, onPress }) => (
        <TextButton key={label} onClick={onPress}>
          <Text style={{ typography: "labelLarge" }}>{label}</Text>
        </TextButton>
      ))}
    </Row>
  );
}

function Footer({ section }: { section: ActivitySection }) {
  const m3 = useThemeM3Colors();
  const text = FOOTERS[section];
  if (!text) return null;

  return (
    <Text
      style={{ typography: "bodySmall" }}
      color={m3.onSurfaceVariant}
      modifiers={[padding(GUTTER + 16, 8, GUTTER, 0)]}
    >
      {text}
    </Text>
  );
}
