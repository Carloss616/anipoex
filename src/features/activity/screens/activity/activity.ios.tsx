import { Button, HStack, List, Section, Spacer } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  listRowBackground,
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { memo, useMemo } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { downloadsPending, split } from "@/features/activity/utils/state";
import { downloadsPaused$ } from "@/features/downloads";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ActivityToolbar } from "./components/activity-toolbar";
import { SectionItem } from "./components/section-item";
import { StatusCard } from "./components/status-card";
import { useActivityIds } from "./hooks/use-activity-ids";
import { ALL_CAUGHT_UP } from "./utils/all-caught-up";
import type { HeaderAction } from "./utils/download-actions";
import {
  type ActivityFilter,
  type ActivitySection,
  countsOf,
  emptyKind,
  parseFilter,
  visibleSections,
} from "./utils/filters";
import { headerActions, NO_DOWNLOADS } from "./utils/header-actions";
import { SECTION_DESCRIPTIONS, sectionTitle } from "./utils/section-header";
import { SECTION_IDS } from "./utils/section-ids";
import { downloadsFailed } from "./utils/state";
import { statusMode } from "./utils/status-mode";

const FOOTERS: Partial<Record<ActivitySection, string>> = {
  ...SECTION_DESCRIPTIONS,
  entries: "Swipe a change to discard it.",
};

type Row = { modifiers: ReturnType<typeof listRowBackground>[] };

/** Everything that runs or waits: scans, downloads, AniList changes, sync. */
export function Activity() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const ids = useActivityIds();
  const statusShown = useValue(() => statusMode() !== "");

  const filter = parseFilter(params.filter);
  const counts = useMemo(() => countsOf(ids), [ids]);
  const empty = emptyKind(ids, filter, statusShown);

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
      {empty === "all" ? (
        <EmptyState {...ALL_CAUGHT_UP} />
      ) : (
        // Joined, so the list re-renders only when a section comes or goes.
        <ActivityList sections={visibleSections(ids, filter).join()} />
      )}
    </>
  );
}

/**
 * Reads only the joined section names: inside a Host, its re-render re-runs
 * every row.
 */
const ActivityList = memo(function ActivityList({
  sections,
}: {
  sections: string;
}) {
  const modifiers = [listRowBackground(useThemeColor("surface-secondary"))];

  return (
    <Host className="flex-1">
      <List
        modifiers={[
          listStyle("insetGrouped"),
          scrollContentBackground("hidden"),
          useFont(),
        ]}
      >
        <StatusSection modifiers={modifiers} />
        {sections ? (
          (split(sections) as ActivitySection[]).map((section) => (
            <SectionView
              key={section}
              section={section}
              modifiers={modifiers}
            />
          ))
        ) : (
          <Section modifiers={[listRowBackground("clear")]}>
            <EmptyState title="Nothing here" />
          </Section>
        )}
      </List>
    </Host>
  );
});

function StatusSection({ modifiers }: Row) {
  const mode = useValue(statusMode);
  if (mode === "") return null;

  return <StatusCard mode={mode} modifiers={modifiers} />;
}

const SectionView = memo(function SectionView({
  section,
  modifiers,
}: Row & { section: ActivitySection }) {
  const ids = split(useValue(SECTION_IDS[section]));
  if (!ids.length) return null;
  const title = sectionTitle(section, ids.length);
  const footer = FOOTERS[section];

  return (
    <Section
      modifiers={modifiers}
      header={
        section === "downloads" ? (
          <DownloadsHeader title={title} />
        ) : (
          <SectionHeader
            title={title}
            actions={headerActions(section, NO_DOWNLOADS)}
          />
        )
      }
      footer={footer ? <Text>{footer}</Text> : undefined}
    >
      <List.ForEach data={ids} keyExtractor={(id) => id} recycling={false}>
        {({ item }) => <SectionItem section={section} id={item} />}
      </List.ForEach>
    </Section>
  );
});

function DownloadsHeader({ title }: { title: string }) {
  const paused = useValue(downloadsPaused$);
  const pending = useValue(downloadsPending);
  const failed = useValue(downloadsFailed);

  return (
    <SectionHeader
      title={title}
      actions={headerActions("downloads", { paused, pending, failed })}
    />
  );
}

function SectionHeader({
  title,
  actions,
}: {
  title: string;
  actions: HeaderAction[];
}) {
  const font = useFont("subheadline", "medium");

  return (
    <HStack>
      <Text>{title}</Text>
      <Spacer />
      {actions.map(({ label, onPress }) => (
        <Button
          key={label}
          label={label}
          onPress={onPress}
          modifiers={[buttonStyle("borderless"), controlSize("small"), font]}
        />
      ))}
    </HStack>
  );
}
