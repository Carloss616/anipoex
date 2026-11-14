import { Button, HStack, List, Section, Spacer } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  listRowBackground,
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { EmptyState } from "@/components/blocks/empty-state";
import { Toolbar } from "@/components/layout/toolbar";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { Icons } from "@/components/ui/icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Overview } from "./components/overview";
import { QueueItem } from "./components/queue-item";
import { RunningItem } from "./components/running-item";
import { SkippedItem } from "./components/skipped-item";
import {
  clearQueue,
  retryAllSkipped,
  startReadingScan,
  stopAll,
} from "./utils/actions";
import {
  hasActivity,
  queuedIds,
  runningIds,
  skippedIds,
  split,
} from "./utils/state";

type Row = { modifiers: ReturnType<typeof listRowBackground>[] };

export function Activity() {
  const active = useValue(hasActivity);
  const destructive = useThemeColor("destructive");

  return (
    <>
      <Stack.Title>Activity</Stack.Title>
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            hidden={!active}
            icon={Icons.stop}
            tintColor={destructive}
            onPress={stopAll}
            accessibilityLabel="Stop all"
          />
        </Stack.Toolbar>
      </Toolbar>
      {active ? (
        <ActivityList />
      ) : (
        <EmptyState
          title="Nothing running"
          description="Scans show here while they run."
          actions={[{ label: "Scan Reading", onPress: startReadingScan }]}
        />
      )}
    </>
  );
}

/** Reads nothing that changes: inside a Host, its re-render re-runs every row. */
function ActivityList() {
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
        <Overview modifiers={modifiers} />
        <RunningSection modifiers={modifiers} />
        <QueueSection modifiers={modifiers} />
        <SkippedSection modifiers={modifiers} />
      </List>
    </Host>
  );
}

function RunningSection({ modifiers }: Row) {
  const ids = split(useValue(runningIds));
  if (!ids.length) return null;

  return (
    <Section title={`Running · ${ids.length}`} modifiers={modifiers}>
      <List.ForEach data={ids} keyExtractor={(id) => id} recycling={false}>
        {({ item }) => <RunningItem mangaId={item} />}
      </List.ForEach>
    </Section>
  );
}

function QueueSection({ modifiers }: Row) {
  const ids = split(useValue(queuedIds));
  if (!ids.length) return null;

  return (
    <Section
      modifiers={modifiers}
      header={
        <SectionHeader
          title={`Up next · ${ids.length}`}
          action="Clear"
          onPress={clearQueue}
        />
      }
      footer={<Text>Each starts when the one before has 2 sources left</Text>}
    >
      <List.ForEach data={ids} keyExtractor={(id) => id} recycling={false}>
        {({ item }) => <QueueItem id={item} />}
      </List.ForEach>
    </Section>
  );
}

function SkippedSection({ modifiers }: Row) {
  const ids = split(useValue(skippedIds));
  if (!ids.length) return null;

  return (
    <Section
      modifiers={modifiers}
      header={
        <SectionHeader
          title="Skipped as slow"
          action="Retry all"
          onPress={retryAllSkipped}
        />
      }
      footer={<Text>Left out of the rest of this scan</Text>}
    >
      <List.ForEach data={ids} keyExtractor={(id) => id} recycling={false}>
        {({ item }) => <SkippedItem sourceId={item} />}
      </List.ForEach>
    </Section>
  );
}

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action: string;
  onPress: () => void;
}) {
  const font = useFont("subheadline", "medium");

  return (
    <HStack>
      <Text>{title}</Text>
      <Spacer />
      <Button
        label={action}
        onPress={onPress}
        modifiers={[buttonStyle("borderless"), controlSize("small"), font]}
      />
    </HStack>
  );
}
