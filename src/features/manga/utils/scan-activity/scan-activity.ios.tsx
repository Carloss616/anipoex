import { HStack, Image, ProgressView, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  monospacedDigit,
  padding,
  progressViewStyle,
} from "@expo/ui/swift-ui/modifiers";
import { requireNativeModule } from "expo";
import type { SFSymbol } from "expo-symbols";
import { createLiveActivity, type LiveActivity } from "expo-widgets";
import { Icons } from "@/components/ui/icon/icons";
import { sfSymbol } from "@/components/ui/icon/utils";
import type { ScanActivity, ScanActivityArgs } from "./scan-activity";
import {
  counted,
  groupStatus,
  isRunning,
  joinGroup,
  type Scan,
  trackScan,
} from "./utils";

// shortcut: iOS grants about 30s once the app leaves the screen; a longer
// scan needs BGContinuedProcessingTask (iOS 26).
const backgroundTime = requireNativeModule<{
  begin(name: string): number;
  end(task: number): void;
}>("BackgroundTime");

interface Props {
  name: string;
  status: string;
  /** 0 to 1; null loops, for a rescan. */
  progress: number | null;
  /** `done/total` for a Scan all; empty for a rescan. */
  count: string;
  icon: SFSymbol;
}

// A widget function runs in its own runtime: all it shows comes in props.
const ScanLiveActivity = createLiveActivity<Props>("ScanActivity", (props) => {
  "widget";
  const secondary = { type: "hierarchical", style: "secondary" } as const;

  return {
    banner: (
      <VStack
        alignment="leading"
        spacing={8}
        modifiers={[padding({ all: 16 })]}
      >
        <HStack spacing={8}>
          <Image systemName={props.icon} />
          <Text modifiers={[font({ weight: "semibold" })]}>{props.name}</Text>
        </HStack>
        <ProgressView
          value={props.progress ?? undefined}
          modifiers={[progressViewStyle("linear")]}
        />
        <Text
          modifiers={[
            font({ size: 13 }),
            foregroundStyle(secondary),
            monospacedDigit(),
          ]}
        >
          {props.status}
        </Text>
      </VStack>
    ),
    compactLeading: <Image systemName={props.icon} />,
    compactTrailing: <Text modifiers={[monospacedDigit()]}>{props.count}</Text>,
    minimal: <Image systemName={props.icon} />,
    expandedLeading: <Image systemName={props.icon} />,
    expandedTrailing: (
      <Text modifiers={[monospacedDigit()]}>{props.count}</Text>
    ),
    expandedBottom: (
      <VStack alignment="leading" spacing={6}>
        <Text modifiers={[font({ weight: "semibold" })]}>{props.name}</Text>
        <ProgressView
          value={props.progress ?? undefined}
          modifiers={[progressViewStyle("linear")]}
        />
      </VStack>
    ),
  };
});

// Left behind by a run that was killed mid-scan.
for (const stale of ScanLiveActivity.getInstances())
  void stale.end("immediate").catch(() => {});

interface Group {
  name: string;
  scans: Scan[];
  activity?: LiveActivity<Props>;
}

const groups = new Map<number, Group>();

const propsOf = ({ name, scans }: Group): Props => {
  const all = counted(scans);
  return {
    name,
    status: groupStatus(scans),
    // Ended, the bar fills instead of looping.
    progress: all ? all.done / all.total : isRunning(scans) ? null : 1,
    count: all ? `${all.done}/${all.total}` : "",
    icon: sfSymbol(Icons.refresh) ?? "arrow.clockwise",
  };
};

const render = (group: Group) => {
  const next = propsOf(group);
  void (
    isRunning(group.scans)
      ? group.activity?.update(next)
      : group.activity?.end("default", next, new Date())
  )?.catch(() => {});
};

/**
 * A Live Activity (Lock Screen, Dynamic Island) of the manga's scans, one for
 * all that run together; a tap opens the manga.
 */
export function startScanActivity({
  mangaId,
  name,
  total,
  source,
}: ScanActivityArgs): ScanActivity {
  const scan: Scan = { done: 0, total, found: null, source: source?.name };
  // Else iOS suspends the app off screen and every probe in flight fails.
  const task = backgroundTime.begin("Scan sources");
  const { group, joined } = joinGroup(groups, mangaId, scan, () => ({
    name,
    scans: [],
  }));
  if (joined) render(group);
  else
    try {
      group.activity = ScanLiveActivity.start(
        propsOf(group),
        `anipoex://manga/${mangaId}`,
      );
    } catch {
      // Live Activities turned off in Settings: the sheet still shows the scan.
    }
  const activity = trackScan(scan, () => render(group));

  return {
    progress: activity.progress,
    end: (found) => {
      activity.end(found);
      backgroundTime.end(task);
    },
  };
}
