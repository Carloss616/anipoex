import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { ScrollView, View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { Toolbar } from "@/components/layout/toolbar";
import { Icons } from "@/components/ui/icon";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
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

/** Up next shows this many; the rest are a count. */
const QUEUE_SHOWN = 10;

/** What runs now: each manga's scan, the Reading scan's queue, its slow sources. */
export function Activity() {
  const active = useValue(hasActivity);
  const headerScroll = useHeaderScroll();

  return (
    <>
      <Stack.Title>Activity</Stack.Title>
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            hidden={!active}
            icon={Icons.stop}
            onPress={stopAll}
            accessibilityLabel="Stop all"
          />
        </Stack.Toolbar>
      </Toolbar>
      {active ? (
        <ScrollView className="flex-1" {...headerScroll}>
          <HeaderInsetView className="gutters px-gx pb-gb w-full max-w-5xl gap-4 self-center lg:flex-row lg:items-start">
            <View className="min-w-0 gap-4 lg:flex-3">
              <RunningSection />
              <QueueSection />
            </View>
            <View className="min-w-0 gap-4 max-lg:order-first lg:flex-2">
              <Overview />
              <SkippedSection />
            </View>
          </HeaderInsetView>
        </ScrollView>
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

function RunningSection() {
  const ids = split(useValue(runningIds));
  if (!ids.length) return null;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{`Running · ${ids.length}`}</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {ids.map((id) => (
          <RunningItem key={id} mangaId={id} />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

function QueueSection() {
  const ids = split(useValue(queuedIds));
  if (!ids.length) return null;
  const more = ids.length - QUEUE_SHOWN;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{`Up next · ${ids.length}`}</Frame.Title>
        <Frame.Description>
          Each starts when the one before has 2 sources left
        </Frame.Description>
        <Frame.Action>
          <Button variant="ghost" size="sm" onClick={clearQueue}>
            Clear
          </Button>
        </Frame.Action>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {ids.slice(0, QUEUE_SHOWN).map((id) => (
          <QueueItem key={id} id={id} />
        ))}
        {more > 0 && (
          <Frame.Row>
            <Frame.Content>
              <Frame.Description>{`${more} more`}</Frame.Description>
            </Frame.Content>
          </Frame.Row>
        )}
      </Frame.Panel>
    </Frame>
  );
}

function SkippedSection() {
  const ids = split(useValue(skippedIds));
  if (!ids.length) return null;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Skipped as slow</Frame.Title>
        <Frame.Description>Left out of the rest of this scan</Frame.Description>
        <Frame.Action>
          <Button variant="ghost" size="sm" onClick={retryAllSkipped}>
            Retry all
          </Button>
        </Frame.Action>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {ids.map((id) => (
          <SkippedItem key={id} sourceId={id} />
        ))}
      </Frame.Panel>
    </Frame>
  );
}
