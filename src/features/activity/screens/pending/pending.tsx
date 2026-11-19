import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Frame } from "panelui-web/frame";
import { ScrollView } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { split, unsentIds, waitingIds } from "@/features/activity/utils/state";
import type { TargetKey } from "@/features/sync/state/engine";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { DownloadsRow } from "./components/downloads-row";
import { EntryItem } from "./components/entry-item";
import { StatusCard } from "./components/status-card";
import { SyncItem } from "./components/sync-item";
import { UnsentItem } from "./components/unsent-item";
import {
  downloadsWait,
  hasPending,
  statusMode,
  syncKeys,
} from "./utils/sections";

/** What waits for a connection, or that AniList turned down. */
export function Pending() {
  const pending = useValue(hasPending);
  const mode = useValue(statusMode);
  const headerScroll = useHeaderScroll();

  return (
    <>
      <Stack.Title>Pending</Stack.Title>
      {pending ? (
        <ScrollView className="flex-1" {...headerScroll}>
          <HeaderInsetView className="gutters px-gx pb-gb w-full gap-4">
            {mode !== "" && <StatusCard mode={mode} />}
            <EntriesSection />
            <UnsentSection />
            <SyncSection />
            <DownloadsSection />
          </HeaderInsetView>
        </ScrollView>
      ) : (
        <EmptyState
          title="Nothing pending"
          description="Changes you make offline show up here until they're sent."
        />
      )}
    </>
  );
}

function EntriesSection() {
  const ids = split(useValue(waitingIds));
  if (!ids.length) return null;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>AniList</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {ids.map((id) => (
          <EntryItem key={id} id={id} />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

function UnsentSection() {
  const ids = split(useValue(unsentIds));
  if (!ids.length) return null;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Not sent</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {ids.map((id) => (
          <UnsentItem key={id} id={id} />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

function SyncSection() {
  const keys = split(useValue(syncKeys)) as TargetKey[];
  if (!keys.length) return null;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Sync</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {keys.map((key) => (
          <SyncItem key={key} id={key} />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

function DownloadsSection() {
  const pending = useValue(downloadsWait);
  if (!pending) return null;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Downloads</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        <DownloadsRow />
      </Frame.Panel>
    </Frame>
  );
}
