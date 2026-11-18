import { Box, Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import {
  corners,
  split,
  unsentIds,
  waitingIds,
} from "@/features/activity/utils/state";
import type { TargetKey } from "@/features/sync/state/engine";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
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
  const headerHeight = useHeaderHeight();
  const setHeaderScrolled = useSetHeaderScrolled();

  return (
    <Host className="flex-1" style={{ marginTop: headerHeight }}>
      <Box modifiers={[fillMaxSize(), pinnedScrollBehavior(setHeaderScrolled)]}>
        <Column
          modifiers={[
            verticalScroll(),
            fillMaxWidth(),
            padding(0, 8, 0, GUTTER),
          ]}
        >
          <StatusSection />
          <EntriesSection />
          <UnsentSection />
          <SyncSection />
          <DownloadsSection />
        </Column>
      </Box>
    </Host>
  );
}

function StatusSection() {
  const mode = useValue(statusMode);
  if (mode === "") return null;

  return <StatusCard mode={mode} />;
}

function EntriesSection() {
  const ids = split(useValue(waitingIds));
  const m3 = useThemeM3Colors();
  if (!ids.length) return null;

  return (
    <>
      <Label title="AniList" />
      {ids.map((id, i) => (
        <EntryItem key={id} id={id} {...corners(i, ids.length)} />
      ))}
      <Text
        style={{ typography: "bodySmall" }}
        color={m3.onSurfaceVariant}
        modifiers={[padding(GUTTER + 16, 8, GUTTER, 0)]}
      >
        Long-press a change to discard it.
      </Text>
    </>
  );
}

function UnsentSection() {
  const ids = split(useValue(unsentIds));
  if (!ids.length) return null;

  return (
    <>
      <Label title="Not sent" />
      {ids.map((id, i) => (
        <UnsentItem key={id} id={id} {...corners(i, ids.length)} />
      ))}
    </>
  );
}

function SyncSection() {
  const keys = split(useValue(syncKeys)) as TargetKey[];
  if (!keys.length) return null;

  return (
    <>
      <Label title="Sync" />
      {keys.map((key, i) => (
        <SyncItem key={key} id={key} {...corners(i, keys.length)} />
      ))}
    </>
  );
}

function DownloadsSection() {
  const pending = useValue(downloadsWait);
  if (!pending) return null;

  return (
    <>
      <Label title="Downloads" />
      <DownloadsRow />
    </>
  );
}

function Label({ title }: { title: string }) {
  const m3 = useThemeM3Colors();

  return (
    <Text
      style={{ typography: "labelLarge" }}
      color={m3.primary}
      modifiers={[padding(GUTTER + 4, 16, GUTTER, 4)]}
    >
      {title}
    </Text>
  );
}
