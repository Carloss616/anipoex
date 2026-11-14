import { Box, Column, Row, Spacer, TextButton } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { EmptyState } from "@/components/blocks/empty-state";
import { Toolbar } from "@/components/layout/toolbar";
import { GUTTER } from "@/components/native/constants";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icons } from "@/components/ui/icon";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
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
  corners,
  hasActivity,
  queuedIds,
  runningIds,
  skippedIds,
  split,
} from "./utils/state";

/** Up next shows this many; the rest are a count. */
const QUEUE_SHOWN = 10;

export function Activity() {
  const active = useValue(hasActivity);
  const m3 = useThemeM3Colors();

  return (
    <>
      <Stack.Title>Activity</Stack.Title>
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            hidden={!active}
            icon={Icons.stop}
            tintColor={m3.error}
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
          <Label title="Now" />
          <Overview />
          <RunningSection />
          <QueueSection />
          <SkippedSection />
        </Column>
      </Box>
    </Host>
  );
}

function RunningSection() {
  const ids = split(useValue(runningIds));
  if (!ids.length) return null;

  return (
    <>
      <Label title={`Running · ${ids.length}`} />
      {ids.map((id, i) => (
        <RunningItem key={id} mangaId={id} {...corners(i, ids.length)} />
      ))}
    </>
  );
}

function QueueSection() {
  const ids = split(useValue(queuedIds));
  if (!ids.length) return null;
  const shown = ids.slice(0, QUEUE_SHOWN);
  const more = ids.length - shown.length;

  return (
    <>
      <Label
        title={`Up next · ${ids.length}`}
        action="Clear"
        onPress={clearQueue}
      />
      {shown.map((id, i) => (
        <QueueItem key={id} id={id} {...corners(i, shown.length)} />
      ))}
      {more > 0 && (
        <Text
          style={{ typography: "bodyMedium" }}
          modifiers={[padding(GUTTER + 16, 8, GUTTER, 0)]}
        >
          {`${more} more`}
        </Text>
      )}
    </>
  );
}

function SkippedSection() {
  const ids = split(useValue(skippedIds));
  if (!ids.length) return null;

  return (
    <>
      <Label
        title="Skipped as slow"
        action="Retry all"
        onPress={retryAllSkipped}
      />
      {ids.map((id, i) => (
        <SkippedItem key={id} sourceId={id} {...corners(i, ids.length)} />
      ))}
    </>
  );
}

function Label({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
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
      {action && onPress ? (
        <TextButton onClick={onPress}>
          <Text style={{ typography: "labelLarge" }}>{action}</Text>
        </TextButton>
      ) : null}
    </Row>
  );
}
