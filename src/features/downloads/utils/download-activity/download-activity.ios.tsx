import {
  Button,
  HStack,
  Image,
  ProgressView,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  font,
  foregroundStyle,
  labelStyle,
  lineLimit,
  monospacedDigit,
  padding,
  progressViewStyle,
} from "@expo/ui/swift-ui/modifiers";
import type { SFSymbol } from "expo-symbols";
import {
  addUserInteractionListener,
  createLiveActivity,
  type LiveActivity,
} from "expo-widgets";
import { Icons } from "@/components/ui/icon/icons";
import { sfSymbol } from "@/components/ui/icon/utils";
import { backgroundWork } from "@/utils/background-time";
import { coalesce } from "@/utils/widget-updates";
import { downloadsSuspended$ } from "../../state/download-queue";
import {
  suspendDownloads,
  unsuspendDownloads,
} from "../../state/run-downloads";
import { countStatus, endStatus } from "../activity-view";
import type { DownloadActivity } from "./download-activity";

const ICON = sfSymbol(Icons.download) ?? "arrow.down";
const PAUSE_ICON = sfSymbol(Icons.pause) ?? "pause.fill";
const PAUSE_TARGET = "pause:downloads";
const SUSPENDED = "Paused · open the app to continue";

interface Props {
  title: string;
  status: string;
  /** 0 to 1, the running chapter's. */
  progress: number;
  /** `done/total`. */
  count: string;
  icon: SFSymbol;
  pauseIcon: SFSymbol;
  /** The Pause button's target; none once paused or ended. */
  pause?: string;
}

// A widget function runs in its own runtime: all it shows comes in props.
const DownloadLiveActivity = createLiveActivity<Props>(
  "DownloadActivity",
  (props) => {
    "widget";
    const caption = [
      font({ size: 13 }),
      foregroundStyle({ type: "hierarchical", style: "secondary" }),
      monospacedDigit(),
    ];
    const pause = props.pause && (
      <Button
        target={props.pause}
        label="Pause downloads"
        systemImage={props.pauseIcon}
        modifiers={[
          labelStyle("iconOnly"),
          buttonStyle("bordered"),
          buttonBorderShape("circle"),
        ]}
      />
    );
    const progress = (
      <ProgressView
        value={props.progress}
        modifiers={[progressViewStyle("linear")]}
      />
    );
    const title = (
      <Text modifiers={[font({ weight: "semibold" }), lineLimit(1)]}>
        {props.title}
      </Text>
    );
    const icon = <Image systemName={props.icon} />;
    const count = <Text modifiers={[monospacedDigit()]}>{props.count}</Text>;

    return {
      banner: (
        <HStack spacing={12} modifiers={[padding({ all: 16 })]}>
          {icon}
          <VStack alignment="leading" spacing={6}>
            {title}
            {progress}
            <Text modifiers={caption}>{props.status}</Text>
          </VStack>
          <Spacer />
          {pause}
        </HStack>
      ),
      compactLeading: icon,
      compactTrailing: count,
      minimal: icon,
      expandedLeading: icon,
      expandedTrailing: (
        <HStack spacing={8}>
          {count}
          {pause}
        </HStack>
      ),
      expandedBottom: (
        <VStack alignment="leading" spacing={6}>
          {title}
          {progress}
        </VStack>
      ),
    };
  },
);

// Left behind by a run that was killed mid-queue.
for (const stale of DownloadLiveActivity.getInstances())
  void stale.end("immediate").catch(() => {});

/** The running activity's Pause; one activity at a time. */
let current: { onPause: () => void } | undefined;
/** The activity left on "Paused" meanwhile. */
let left: LiveActivity<Props> | undefined;

// iOS suspends the app once its background time runs out: the downloads pause
// before that, the activity says so, and they resume when the app is back.
const work = backgroundWork("Downloads", {
  running: () => current !== undefined,
  expire: suspendDownloads,
  back: () => {
    void left?.end("immediate").catch(() => {});
    left = undefined;
    unsuspendDownloads();
  },
});
const release = () => {
  if (!current) work.release();
};

addUserInteractionListener(({ target }) => {
  if (target === PAUSE_TARGET) current?.onPause();
});

const start = (props: Props) => {
  try {
    return DownloadLiveActivity.start(
      props,
      "anipoex://settings/activity?filter=downloads",
    );
  } catch {
    // Live Activities turned off in Settings: Activity still shows the queue.
    return undefined;
  }
};

/**
 * A Live Activity (Lock Screen, Dynamic Island) of the downloads, with Pause;
 * a tap opens Activity.
 */
export function startDownloadActivity(onPause: () => void): DownloadActivity {
  const self = { onPause };
  current = self;
  work.hold();
  let live: LiveActivity<Props> | undefined;
  let last: Props | undefined;
  /** Paused by iOS's clock: the end keeps the activity for the app's return. */
  let keep = false;
  const updates = coalesce<Props>((props, end) =>
    end && !keep
      ? live?.end("default", props, new Date())
      : live?.update(props),
  );

  return {
    update: ({ title, done, total, fraction }) => {
      if (current !== self) return;
      const next: Props = {
        title,
        status: countStatus({ done, total }),
        progress: fraction,
        count: `${done}/${total}`,
        icon: ICON,
        pauseIcon: PAUSE_ICON,
        pause: PAUSE_TARGET,
      };
      if (last) updates.push(next);
      else live = start(next);
      last = next;
    },
    end: (summary) => {
      if (current !== self) return;
      current = undefined;
      if (!last) return release();
      keep = downloadsSuspended$.peek();
      if (keep) left = live;
      const status = keep
        ? SUSPENDED
        : summary.paused
          ? "Paused"
          : endStatus(summary);
      const finished = summary.paused
        ? {}
        : { title: "Downloads", progress: 1 };
      // Kept until the end lands, which waits for the update in flight.
      void updates
        .end({ ...last, ...finished, status, pause: undefined })
        .finally(release);
    },
  };
}
