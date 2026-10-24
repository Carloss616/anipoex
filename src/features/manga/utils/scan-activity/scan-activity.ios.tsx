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
import { scanStatus } from "./utils";

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

// A widget function runs in its own runtime: everything it shows comes in props.
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

/** A Live Activity on the Lock Screen and in the Dynamic Island; tapping it opens the manga. */
export function startScanActivity({
  mangaId,
  name,
  total,
  source,
}: ScanActivityArgs): ScanActivity {
  const icon = sfSymbol(Icons.refresh) ?? "arrow.clockwise";
  const at = (done: number, found: number | null): Props => ({
    name,
    status: scanStatus({ done, total, found, source: source?.name }),
    progress: source ? null : done / total,
    count: source ? "" : `${done}/${total}`,
    icon,
  });
  // Without it iOS suspends the app on leaving the screen and every probe in flight fails.
  const task = backgroundTime.begin("Scan sources");
  let activity: LiveActivity<Props> | undefined;
  try {
    activity = ScanLiveActivity.start(
      at(0, null),
      `anipoex://manga/${mangaId}`,
    );
  } catch {
    // Live Activities turned off in Settings: the sheet still shows the scan.
  }

  return {
    progress: (done) => void activity?.update(at(done, null)).catch(() => {}),
    end: (found) => {
      void activity
        ?.end("default", at(total, found), new Date())
        .catch(() => {});
      backgroundTime.end(task);
    },
  };
}
