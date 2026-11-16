import {
  Column,
  getMaterialColors,
  LinearProgressIndicator,
  Row,
  Text,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  cornerRadius,
  fillMaxWidth,
  height,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import {
  addUserInteractionListener,
  type CustomNotification,
  createCustomNotification,
} from "expo-widgets";
import { PermissionsAndroid } from "react-native";
import { TRACK_HEIGHT } from "@/components/ui/progress/constants";
import { coalesce, notificationLimiter } from "@/utils/widget-updates";
import { countStatus, endStatus } from "../activity-view";
import type { DownloadActivity } from "./download-activity";

const PAUSE_TARGET = "pause:downloads";

interface Props {
  title: string;
  status: string;
  /** 0 to 1, the running chapter's. */
  progress: number;
  /** Set once the downloads end. */
  ended: boolean;
  /** The house Progress's track; the shade takes it only as a plain bar. */
  trackHeight: number;
  /** The Pause button's target; none once ended. */
  pause?: string;
}

// A widget function runs in its own runtime: all it shows comes in props.
const DownloadNotification = createCustomNotification<Props>(
  "DownloadNotification",
  (props) => {
    "widget";
    // The device's palette in the shade's scheme: the shade follows the
    // device's theme, not the app's.
    const m3 = getMaterialColors();
    const title = (
      <Text
        color={m3.onSurface}
        maxLines={1}
        style={{ typography: "titleSmall" }}
      >
        {props.title}
      </Text>
    );
    const progress = (
      <LinearProgressIndicator
        progress={props.progress}
        color={m3.primary}
        trackColor={m3.surfaceContainerHighest}
        modifiers={[
          fillMaxWidth(),
          height(props.trackHeight),
          cornerRadius(props.trackHeight / 2),
        ]}
      />
    );
    const status = (
      <Text color={m3.onSurfaceVariant} style={{ typography: "bodySmall" }}>
        {props.status}
      </Text>
    );

    return {
      collapsed: (
        <Column modifiers={[fillMaxWidth()]}>
          {title}
          {props.ended ? status : progress}
        </Column>
      ),
      expanded: (
        <Column modifiers={[fillMaxWidth()]}>
          {title}
          {!props.ended && progress}
          {status}
          {props.pause && (
            <Row modifiers={[padding(0, 4, 0, 0)]}>
              {/* The Compose Button's types lack the widget-only `target`. */}
              <TextButton
                {...{ target: props.pause }}
                colors={{ contentColor: m3.primary }}
              >
                <Text color={m3.primary}>Pause</Text>
              </TextButton>
            </Row>
          )}
        </Column>
      ),
    };
  },
);

// Left behind by a run that was killed mid-queue.
void DownloadNotification.cancelAll().catch(() => {});

/** The running notification's Pause; one at a time. */
let current: { onPause: () => void } | undefined;

addUserInteractionListener(({ target }) => {
  if (target === PAUSE_TARGET) current?.onPause();
});

const ENDED = { ongoing: false, autoCancel: true };

// A post or update rejects any undefined value, nested ones too; JSON drops them.
const defined = (props: Props): Props => JSON.parse(JSON.stringify(props));

/**
 * An ongoing notification of the downloads, with Pause; a tap opens Activity.
 */
export function startDownloadActivity(onPause: () => void): DownloadActivity {
  const self = { onPause };
  current = self;
  let shown: Promise<CustomNotification<Props> | undefined> | undefined;
  const updates = coalesce<Props>(
    (props, end) =>
      shown?.then((notification) =>
        notification?.update(defined(props), end ? ENDED : {}),
      ),
    notificationLimiter,
  );
  // Denied or dismissed, the post rejects and Activity still shows the queue.
  // Queued now, so the notification's updates come after it.
  const post = (props: Props) =>
    new Promise<CustomNotification<Props> | undefined>((resolve) =>
      notificationLimiter.run(() => {
        const posted = PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        )
          .catch(() => {})
          .then(() =>
            DownloadNotification.post(defined(props), {
              id: "downloads",
              ongoing: true,
              url: "anipoex://settings/activity",
            }),
          )
          .catch(() => undefined);
        resolve(posted);
        return posted;
      }),
    );
  let last: Props | undefined;

  return {
    update: ({ title, done, total, fraction }) => {
      if (current !== self) return;
      const next: Props = {
        title,
        status: countStatus({ done, total }),
        progress: fraction,
        ended: false,
        trackHeight: TRACK_HEIGHT.md,
        pause: PAUSE_TARGET,
      };
      if (shown) updates.push(next);
      else shown = post(next);
      last = next;
    },
    end: (summary) => {
      if (current !== self) return;
      current = undefined;
      if (!last) return;
      void updates.end({
        ...last,
        title: "Downloads",
        status: endStatus(summary),
        progress: 1,
        ended: true,
        pause: undefined,
      });
    },
  };
}
