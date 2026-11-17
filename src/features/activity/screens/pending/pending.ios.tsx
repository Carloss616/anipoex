import { List, Section } from "@expo/ui/swift-ui";
import {
  listRowBackground,
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { EmptyState } from "@/components/blocks/empty-state";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import {
  downloadsPending,
  split,
  unsentIds,
  waitingIds,
} from "@/features/activity/utils/state";
import type { TargetKey } from "@/features/sync/state/engine";
import { useThemeColor } from "@/hooks/use-theme-color";
import { DownloadsRow } from "./components/downloads-row";
import { EntryItem } from "./components/entry-item";
import { StatusCard } from "./components/status-card";
import { SyncItem } from "./components/sync-item";
import { UnsentItem } from "./components/unsent-item";
import { hasPending, statusMode, syncKeys } from "./utils/sections";

type Row = { modifiers: ReturnType<typeof listRowBackground>[] };

export function Pending() {
  const pending = useValue(hasPending);

  return (
    <>
      <Stack.Title>Pending</Stack.Title>
      {pending ? (
        <PendingList />
      ) : (
        <EmptyState
          title="Nothing pending"
          description="Changes you make offline show up here until they're sent."
        />
      )}
    </>
  );
}

/** Reads nothing that changes: inside a Host, its re-render re-runs every row. */
function PendingList() {
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
        <EntriesSection modifiers={modifiers} />
        <UnsentSection modifiers={modifiers} />
        <SyncSection modifiers={modifiers} />
        <DownloadsSection modifiers={modifiers} />
      </List>
    </Host>
  );
}

function StatusSection({ modifiers }: Row) {
  const mode = useValue(statusMode);
  if (mode === "") return null;

  return (
    <Section modifiers={modifiers}>
      <StatusCard mode={mode} />
    </Section>
  );
}

function EntriesSection({ modifiers }: Row) {
  const ids = split(useValue(waitingIds));
  if (!ids.length) return null;

  return (
    <Section
      title="AniList"
      modifiers={modifiers}
      footer={<Text>Swipe a change to discard it.</Text>}
    >
      <List.ForEach data={ids} keyExtractor={(id) => id} recycling={false}>
        {({ item }) => <EntryItem id={item} />}
      </List.ForEach>
    </Section>
  );
}

function UnsentSection({ modifiers }: Row) {
  const ids = split(useValue(unsentIds));
  if (!ids.length) return null;

  return (
    <Section title="Not sent" modifiers={modifiers}>
      <List.ForEach data={ids} keyExtractor={(id) => id} recycling={false}>
        {({ item }) => <UnsentItem id={item} />}
      </List.ForEach>
    </Section>
  );
}

function SyncSection({ modifiers }: Row) {
  const keys = split(useValue(syncKeys)) as TargetKey[];
  if (!keys.length) return null;

  return (
    <Section title="Sync" modifiers={modifiers}>
      <List.ForEach data={keys} keyExtractor={(key) => key} recycling={false}>
        {({ item }) => <SyncItem id={item} />}
      </List.ForEach>
    </Section>
  );
}

function DownloadsSection({ modifiers }: Row) {
  const pending = useValue(downloadsPending);
  if (!pending) return null;

  return (
    <Section title="Downloads" modifiers={modifiers}>
      <DownloadsRow />
    </Section>
  );
}
