import {
  Column,
  getMaterialColors,
  LinearProgressIndicator,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  cornerRadius,
  fillMaxWidth,
  height,
} from "@expo/ui/jetpack-compose/modifiers";
import {
  type CustomNotification,
  createCustomNotification,
} from "expo-widgets";
import { PermissionsAndroid } from "react-native";
import { TRACK_HEIGHT } from "@/components/ui/progress/constants";
import type { ScanActivity, ScanActivityArgs } from "./scan-activity";
import { scanStatus } from "./utils";

interface Props {
  name: string;
  status: string;
  /** 0 to 1; null loops, for a rescan. */
  progress: number | null;
  /** Set once the scan ends. */
  ended: boolean;
  /** The house Progress's track, which the shade can only take as a plain bar. */
  trackHeight: number;
}

// A widget function runs in its own runtime: everything it shows comes in props.
const ScanNotification = createCustomNotification<Props>(
  "ScanNotification",
  (props) => {
    "widget";
    // The device's palette in the shade's scheme: the shade follows the
    // device's theme, not the app's.
    const m3 = getMaterialColors();
    const progress = (
      <LinearProgressIndicator
        progress={props.progress ?? undefined}
        color={m3.primary}
        trackColor={m3.surfaceContainerHighest}
        modifiers={[
          fillMaxWidth(),
          height(props.trackHeight),
          cornerRadius(props.trackHeight / 2),
        ]}
      />
    );
    const name = (
      <Text color={m3.onSurface} style={{ typography: "titleSmall" }}>
        {props.name}
      </Text>
    );

    return {
      collapsed: (
        <Column verticalArrangement={{ spacedBy: 4 }}>
          {name}
          {/* A rescan has no count on its bar, so it names its source. */}
          {(props.ended || props.progress === null) && (
            <Text color={m3.onSurfaceVariant}>{props.status}</Text>
          )}
          {!props.ended && progress}
        </Column>
      ),
      expanded: (
        <Column verticalArrangement={{ spacedBy: 6 }}>
          {name}
          {!props.ended && progress}
          <Text color={m3.onSurfaceVariant} style={{ typography: "bodySmall" }}>
            {props.status}
          </Text>
        </Column>
      ),
    };
  },
);

// Left behind by a run that was killed mid-scan.
void ScanNotification.cancelAll().catch(() => {});

/** An ongoing notification with the scan's progress; tapping it opens the manga. */
export function startScanActivity({
  mangaId,
  name,
  total,
  source,
}: ScanActivityArgs): ScanActivity {
  const at = (done: number, found: number | null): Props => ({
    name,
    status: scanStatus({ done, total, found, source: source?.name }),
    progress: source ? null : done / total,
    ended: found !== null,
    trackHeight: TRACK_HEIGHT.md,
  });
  // Denied or dismissed, the post rejects and the sheet still shows the scan.
  let shown: Promise<CustomNotification<Props> | undefined> =
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    )
      .catch(() => {})
      .then(() =>
        ScanNotification.post(at(0, null), {
          // Rescans of different sources run together, each in its own.
          id: source ? `scan-${mangaId}-${source.id}` : `scan-${mangaId}`,
          ongoing: true,
          url: `anipoex://manga/${mangaId}`,
        }),
      )
      .catch(() => undefined);
  // In order: an update that lands before the post would be lost.
  const update = (next: Props) => {
    shown = shown.then((notification) =>
      notification
        ?.update(next, next.ended ? { ongoing: false, autoCancel: true } : {})
        .then(
          () => notification,
          () => notification,
        ),
    );
  };

  return {
    progress: (done) => update(at(done, null)),
    end: (found) => update(at(total, found)),
  };
}
