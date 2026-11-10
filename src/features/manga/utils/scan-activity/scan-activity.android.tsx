import {
  Box,
  Column,
  getMaterialColors,
  Image,
  LinearProgressIndicator,
  Row,
  Text,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  background,
  cornerRadius,
  fillMaxWidth,
  height,
  padding,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import {
  addUserInteractionListener,
  type CustomNotification,
  type CustomNotificationOptions,
  createCustomNotification,
} from "expo-widgets";
import { PermissionsAndroid } from "react-native";
import { TRACK_HEIGHT } from "@/components/ui/progress/constants";
import { scanStops } from "../../state/scan-views";
import { type LibraryActivity, libraryStatus } from "../library-run";
import type {
  LibraryActivityArgs,
  ScanActivity,
  ScanActivityArgs,
} from "./scan-activity";
import { marksById, type SourceMark, setMark } from "./utils/marks";
import {
  counted,
  groupStatus,
  isRunning,
  joinGroup,
  type Scan,
  scanStatus,
  trackScan,
} from "./utils/status";
import { widgetImage } from "./utils/widget-image";
import {
  coalesce,
  imageLoader,
  limiter,
  routeStop,
  stopTarget,
  type WidgetMark,
  type WidgetUpdates,
  widgetMarks,
} from "./utils/widget-props";

interface Props {
  name: string;
  status: string;
  /** 0 to 1; null loops, for a rescan. */
  progress: number | null;
  /** Set once the scan ends. */
  ended: boolean;
  /** The house Progress's track; the shade takes it only as a plain bar. */
  trackHeight: number;
  /** The cover's widget file. */
  cover?: string;
  marks: WidgetMark[];
  more: number;
  /** The Reading scan's place in the list. */
  library?: string;
  /** An ended Reading scan's manga with new chapters, up to 3. */
  covers: string[];
  /** The Stop button's target; none once the scan ends. */
  stop?: string;
}

// A widget function runs in its own runtime: all it shows comes in props.
const ScanNotification = createCustomNotification<Props>(
  "ScanNotification",
  (props) => {
    "widget";
    // The device's palette in the shade's scheme: the shade follows the
    // device's theme, not the app's.
    const m3 = getMaterialColors();
    const cover = (uri: string | undefined, width: number, tall: number) =>
      uri && (
        <Image
          source={{ uri }}
          contentScale="crop"
          modifiers={[size(width, tall), cornerRadius(width / 6)]}
        />
      );
    const covers = (width: number, tall: number) =>
      props.covers.length > 0 ? (
        <Row>
          {props.covers.map((uri, i) => (
            <Box key={String(i)} modifiers={[padding(0, 0, 4, 0)]}>
              {cover(uri, width, tall)}
            </Box>
          ))}
        </Row>
      ) : (
        cover(props.cover, width, tall)
      );
    const mark = (m: WidgetMark, i: number) => {
      const dim = m.state === "pending" || m.state === "nomatch";
      return (
        <Column
          key={String(i)}
          horizontalAlignment="center"
          modifiers={[padding(0, 0, 4, 0)]}
        >
          {m.uri ? (
            <Image
              source={{ uri: m.uri }}
              alpha={dim ? 0.4 : 1}
              modifiers={[size(18, 18), cornerRadius(5)]}
            />
          ) : (
            <Box
              contentAlignment="center"
              modifiers={[
                size(18, 18),
                cornerRadius(5),
                background(m3.surfaceContainerHighest),
              ]}
            >
              {/* A Box has no alpha: its initials dim instead. */}
              <Text
                color={dim ? m3.outline : m3.onSurfaceVariant}
                style={{ fontSize: 8, fontWeight: "bold" }}
              >
                {m.initials}
              </Text>
            </Box>
          )}
          {m.state === "found" && !!m.unread && (
            <Text
              color={m3.primary}
              style={{ fontSize: 9, fontWeight: "bold" }}
            >{`+${m.unread}`}</Text>
          )}
        </Column>
      );
    };
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
      <Text
        color={m3.onSurface}
        maxLines={1}
        style={{ typography: "titleSmall" }}
      >
        {props.name}
      </Text>
    );
    const status = (
      <Text color={m3.onSurfaceVariant} style={{ typography: "bodySmall" }}>
        {props.status}
      </Text>
    );

    return {
      collapsed: (
        <Row verticalAlignment="center">
          {covers(28, 40)}
          <Column modifiers={[fillMaxWidth(), padding(8, 0, 0, 0)]}>
            {name}
            {/* A rescan has no count on its bar, so it names its source. */}
            {(props.ended || props.progress === null) && status}
            {!props.ended && progress}
          </Column>
        </Row>
      ),
      expanded: (
        <Column>
          <Row verticalAlignment="center">
            {covers(40, 56)}
            <Column modifiers={[fillMaxWidth(), padding(8, 0, 0, 0)]}>
              {props.library && (
                <Text
                  color={m3.onSurfaceVariant}
                  style={{ typography: "labelSmall" }}
                >
                  {props.library}
                </Text>
              )}
              {name}
              {props.marks.length > 0 && (
                <Row modifiers={[padding(0, 4, 0, 4)]}>
                  {props.marks.map(mark)}
                  {props.more > 0 && (
                    <Text
                      color={m3.onSurfaceVariant}
                      style={{ typography: "labelSmall" }}
                    >{`+${props.more}`}</Text>
                  )}
                </Row>
              )}
              {!props.ended && progress}
              {status}
            </Column>
          </Row>
          {props.stop && (
            // Under the text, past the 40dp cover and its 8dp gap.
            <Row modifiers={[padding(48, 4, 0, 0)]}>
              {/* The Compose Button's types lack the widget-only `target`. */}
              <TextButton
                {...{ target: props.stop }}
                colors={{ contentColor: m3.primary }}
              >
                <Text color={m3.primary}>Stop</Text>
              </TextButton>
            </Row>
          )}
        </Column>
      ),
    };
  },
);

// Left behind by a run that was killed mid-scan.
void ScanNotification.cancelAll().catch(() => {});

addUserInteractionListener(({ target }) => routeStop(target));

type Shown = Promise<CustomNotification<Props> | undefined>;

const ENDED = { ongoing: false, autoCancel: true };

// Android sheds an app's notification posts past 5 a second, counted across
// all of them: every scan notification's posts and updates share one spacing.
const spacing = limiter(350);

// Also over an ended one, which the user may have dismissed. Denied or
// dismissed, the post rejects and the sheet still shows the scan. Queued
// now, so the notification's updates come after it.
const post = (props: Props, options: CustomNotificationOptions): Shown =>
  new Promise((resolve) =>
    spacing.run(() => {
      const posted = PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
        .catch(() => {})
        .then(() => ScanNotification.post(props, options))
        .catch(() => undefined);
      resolve(posted);
      return posted;
    }),
  );

const updates = (shown: Shown) =>
  coalesce<Props>(
    (props, end) =>
      shown.then((notification) =>
        notification?.update(props, end ? ENDED : {}),
      ),
    spacing,
  );

interface Group {
  key: string;
  name: string;
  cover?: string;
  scans: Scan[];
  marks: Record<string, SourceMark>;
  image: (url: string | undefined) => string | undefined;
  updates?: WidgetUpdates<Props>;
}

const groups = new Map<number, Group>();

const propsOf = (group: Group): Props => {
  const { key, name, scans, image } = group;
  const all = counted(scans);
  const running = isRunning(scans);
  return {
    name,
    status: groupStatus(scans),
    progress: all ? all.done / all.total : null,
    ended: !running,
    trackHeight: TRACK_HEIGHT.md,
    cover: image(group.cover),
    ...widgetMarks(Object.values(group.marks), image),
    covers: [],
    stop: running && scanStops.has(key) ? stopTarget(key) : undefined,
  };
};

const render = (group: Group) => {
  const next = propsOf(group);
  if (next.ended) void group.updates?.end(next);
  else group.updates?.push(next);
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
  cover,
  sources,
  onStop,
}: ScanActivityArgs): ScanActivity {
  const scan: Scan = { done: 0, total, found: null, source: source?.name };
  const { group, running } = joinGroup(groups, mangaId, scan, () => {
    const next: Group = {
      key: String(mangaId),
      name,
      cover,
      scans: [],
      marks: {},
      image: () => undefined,
    };
    next.image = imageLoader(() => render(next));
    return next;
  });
  Object.assign(group.marks, marksById(sources));
  if (onStop) scanStops.set(group.key, onStop);
  if (running) render(group);
  else
    group.updates = updates(
      post(propsOf(group), {
        id: `scan-${mangaId}`,
        ongoing: true,
        url: `anipoex://manga/${mangaId}`,
      }),
    );

  const tracked = trackScan(scan, () => render(group));

  return {
    progress: tracked.progress,
    mark: (id, mark) => {
      setMark(group.marks, id, mark);
      render(group);
    },
    end: (found) => {
      tracked.end(found);
      if (!isRunning(group.scans)) scanStops.delete(group.key);
    },
  };
}

// Runs share one notification id: a run's late end must not land on the next.
let libraryRun = 0;

/**
 * The Reading scan in one notification, showing each manga as it comes; its
 * scans post none of their own. A tap opens the list.
 */
export function startLibraryActivity({
  total,
  onStop,
}: LibraryActivityArgs): LibraryActivity {
  const run = ++libraryRun;
  scanStops.set("library", onStop);
  let view: {
    name: string;
    cover?: string;
    marks: Record<string, SourceMark>;
    scan?: Scan;
    index: number;
    newSoFar: number;
  } = { name: "Reading", marks: {}, index: 1, newSoFar: 0 };
  let ended = false;
  const propsOfView = (): Props => {
    const { scan, index } = view;
    const done = index - 1 + (scan ? scan.done / scan.total : 0);
    return {
      name: view.name,
      status: scan ? scanStatus(scan) : "Checking sources",
      progress: total ? done / total : 0,
      ended: false,
      trackHeight: TRACK_HEIGHT.md,
      cover: image(view.cover),
      ...widgetMarks(Object.values(view.marks), image),
      library: `Reading · ${index} of ${total} · ${view.newSoFar} new`,
      covers: [],
      stop: stopTarget("library"),
    };
  };
  const render = () => {
    if (!ended) notification.push(propsOfView());
  };
  const image = imageLoader(render);
  const notification = updates(
    post(propsOfView(), {
      id: "scan-library",
      ongoing: true,
      url: "anipoex://manga",
    }),
  );

  return {
    manga: ({ entry, index, newSoFar }) => {
      // Shown before its scan starts: a manga read recently never starts one.
      view = {
        name: entry.name,
        cover: entry.cover,
        marks: {},
        index,
        newSoFar,
      };
      render();
      return ({ name, total: sources, cover, ...args }) => {
        const scan: Scan = { done: 0, total: sources, found: null };
        const marks = marksById(args.sources);
        view = { ...view, name, cover, marks, scan };
        render();
        return {
          ...trackScan(scan, render),
          mark: (id, mark) => {
            setMark(marks, id, mark);
            render();
          },
        };
      };
    },
    end: (summary) => {
      ended = true;
      scanStops.delete("library");
      void Promise.all(
        summary.withNew.slice(0, 3).map((m) => widgetImage(m.cover)),
      ).then((covers) => {
        if (run !== libraryRun) return;
        void notification.end({
          name: "Reading",
          status: libraryStatus(summary),
          progress: 1,
          ended: true,
          trackHeight: TRACK_HEIGHT.md,
          marks: [],
          more: 0,
          covers: covers.filter((c): c is string => !!c),
        });
      });
    },
  };
}
