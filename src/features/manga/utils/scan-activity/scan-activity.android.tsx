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
import type { LibraryActivity } from "../library-run";
import type {
  LibraryActivityArgs,
  ScanActivity,
  ScanActivityArgs,
} from "./scan-activity";
import {
  counted,
  groupStatus,
  isRunning,
  joinGroup,
  type Scan,
  trackScan,
} from "./utils/status";

interface Props {
  name: string;
  status: string;
  /** 0 to 1; null loops, for a rescan. */
  progress: number | null;
  /** Set once the scan ends. */
  ended: boolean;
  /** The house Progress's track; the shade takes it only as a plain bar. */
  trackHeight: number;
}

// A widget function runs in its own runtime: all it shows comes in props.
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

interface Group {
  name: string;
  scans: Scan[];
  shown: Promise<CustomNotification<Props> | undefined>;
}

const groups = new Map<number, Group>();

const propsOf = ({ name, scans }: Group): Props => {
  const all = counted(scans);
  return {
    name,
    status: groupStatus(scans),
    progress: all ? all.done / all.total : null,
    ended: !isRunning(scans),
    trackHeight: TRACK_HEIGHT.md,
  };
};

// In order: an update that lands before the post would be lost.
const render = (group: Group) => {
  group.shown = group.shown.then((notification) => {
    const next = propsOf(group);
    return notification
      ?.update(next, next.ended ? { ongoing: false, autoCancel: true } : {})
      .then(
        () => notification,
        () => notification,
      );
  });
};

/**
 * An ongoing notification of the manga's scans, one for all that run
 * together; a tap opens the manga.
 */
export function startScanActivity({
  mangaId,
  name,
  total,
  source,
}: ScanActivityArgs): ScanActivity {
  const scan: Scan = { done: 0, total, found: null, source: source?.name };
  const { group, running } = joinGroup(groups, mangaId, scan, () => ({
    name,
    scans: [],
    shown: Promise.resolve(undefined),
  }));
  if (running) render(group);
  // Also over an ended one, which the user may have dismissed. Denied or
  // dismissed, the post rejects and the sheet still shows the scan.
  else
    group.shown = PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    )
      .catch(() => {})
      .then(() =>
        ScanNotification.post(propsOf(group), {
          id: `scan-${mangaId}`,
          ongoing: true,
          url: `anipoex://manga/${mangaId}`,
        }),
      )
      .catch(() => undefined);

  return { ...trackScan(scan, () => render(group)), mark: () => {} };
}

// shortcut: reports nothing, until the Reading scan gets its own view.
export function startLibraryActivity(
  _args: LibraryActivityArgs,
): LibraryActivity {
  const none = () => {};
  return {
    manga: () => () => ({ progress: none, mark: none, end: none }),
    end: none,
  };
}
