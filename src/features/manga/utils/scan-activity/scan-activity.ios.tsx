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
  aspectRatio,
  background,
  buttonBorderShape,
  buttonStyle,
  clipShape,
  font,
  foregroundStyle,
  frame,
  labelStyle,
  lineLimit,
  monospacedDigit,
  opacity,
  padding,
  progressViewStyle,
  resizable,
  shapes,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { requireNativeModule } from "expo";
import type { SFSymbol } from "expo-symbols";
import {
  addUserInteractionListener,
  createLiveActivity,
  type LiveActivity,
} from "expo-widgets";
import { Icons } from "@/components/ui/icon/icons";
import { sfSymbol } from "@/components/ui/icon/utils";
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
  routeStop,
  stopTarget,
  type WidgetMark,
  type WidgetUpdates,
  widgetMarks,
} from "./utils/widget-props";

// shortcut: iOS grants about 30s once the app leaves the screen; a longer
// scan needs BGContinuedProcessingTask (iOS 26).
const backgroundTime = requireNativeModule<{
  begin(name: string): number;
  end(task: number): void;
}>("BackgroundTime");

const ICON = sfSymbol(Icons.refresh) ?? "arrow.clockwise";
const STOP_ICON = sfSymbol(Icons.stop) ?? "stop.fill";

interface Props {
  name: string;
  status: string;
  /** 0 to 1; null loops, for a rescan. */
  progress: number | null;
  /** `done/total` for a Scan all or the Reading scan; empty for a rescan. */
  count: string;
  icon: SFSymbol;
  stopIcon: SFSymbol;
  /** The cover's widget file; none shows the icon. */
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
const ScanLiveActivity = createLiveActivity<Props>("ScanActivity", (props) => {
  "widget";
  const secondary = { type: "hierarchical", style: "secondary" } as const;
  const caption = [
    font({ size: 13 }),
    foregroundStyle(secondary),
    monospacedDigit(),
  ];
  const cover = (uri: string | undefined, width: number, height: number) =>
    uri ? (
      <Image
        uiImage={uri}
        modifiers={[
          resizable(),
          aspectRatio({ contentMode: "fill" }),
          frame({ width, height }),
          clipShape("roundedRectangle", width / 6),
        ]}
      />
    ) : (
      <Image systemName={props.icon} />
    );
  const mark = (m: WidgetMark, i: number) => (
    <VStack
      key={String(i)}
      spacing={2}
      modifiers={[
        opacity(m.state === "pending" || m.state === "nomatch" ? 0.4 : 1),
      ]}
    >
      {m.uri ? (
        <Image
          uiImage={m.uri}
          modifiers={[
            resizable(),
            frame({ width: 18, height: 18 }),
            clipShape("roundedRectangle", 5),
          ]}
        />
      ) : (
        <Text
          modifiers={[
            font({ size: 8, weight: "bold" }),
            frame({ width: 18, height: 18 }),
            background(
              { type: "hierarchical", style: "quaternary" },
              shapes.roundedRectangle({ cornerRadius: 5 }),
            ),
          ]}
        >
          {m.initials}
        </Text>
      )}
      {m.state === "found" && !!m.unread && (
        <Text
          modifiers={[
            font({ size: 9, weight: "semibold" }),
            foregroundStyle("green"),
            monospacedDigit(),
          ]}
        >
          {`+${m.unread}`}
        </Text>
      )}
    </VStack>
  );
  const stop = props.stop && (
    <Button
      target={props.stop}
      label="Stop scan"
      systemImage={props.stopIcon}
      modifiers={[
        labelStyle("iconOnly"),
        buttonStyle("bordered"),
        buttonBorderShape("circle"),
        tint("red"),
      ]}
    />
  );
  const progress = (
    <ProgressView
      value={props.progress ?? undefined}
      modifiers={[progressViewStyle("linear")]}
    />
  );
  const count = <Text modifiers={[monospacedDigit()]}>{props.count}</Text>;

  return {
    banner: (
      <HStack spacing={12} modifiers={[padding({ all: 16 })]}>
        {props.covers.length > 0 ? (
          <HStack spacing={4}>
            {props.covers.map((uri, i) => (
              <VStack key={String(i)}>{cover(uri, 30, 44)}</VStack>
            ))}
          </HStack>
        ) : (
          cover(props.cover, 44, 64)
        )}
        <VStack alignment="leading" spacing={6}>
          {props.library && <Text modifiers={caption}>{props.library}</Text>}
          <Text modifiers={[font({ weight: "semibold" }), lineLimit(1)]}>
            {props.name}
          </Text>
          {props.marks.length > 0 && (
            <HStack alignment="top" spacing={4}>
              {props.marks.map(mark)}
              {props.more > 0 && (
                <Text modifiers={caption}>{`+${props.more}`}</Text>
              )}
            </HStack>
          )}
          {progress}
          <Text modifiers={caption}>{props.status}</Text>
        </VStack>
        <Spacer />
        {stop}
      </HStack>
    ),
    compactLeading: cover(props.cover, 18, 24),
    compactTrailing: count,
    minimal: cover(props.cover, 16, 22),
    expandedLeading: cover(props.cover, 32, 46),
    expandedTrailing: (
      <HStack spacing={8}>
        {count}
        {stop}
      </HStack>
    ),
    expandedBottom: (
      <VStack alignment="leading" spacing={6}>
        <Text modifiers={[font({ weight: "semibold" })]}>{props.name}</Text>
        {progress}
      </VStack>
    ),
  };
});

// Left behind by a run that was killed mid-scan.
for (const stale of ScanLiveActivity.getInstances())
  void stale.end("immediate").catch(() => {});

addUserInteractionListener(({ target }) => routeStop(target));

const start = (props: Props, url: string) => {
  try {
    return ScanLiveActivity.start(props, url);
  } catch {
    // Live Activities turned off in Settings: the sheet still shows the scan.
    return undefined;
  }
};

const updates = (activity: LiveActivity<Props> | undefined) =>
  coalesce<Props>((props, end) =>
    end ? activity?.end("default", props, new Date()) : activity?.update(props),
  );

interface Group {
  key: string;
  name: string;
  cover?: string;
  scans: Scan[];
  marks: Record<string, SourceMark>;
  image: (url: string | undefined) => string | undefined;
  activity?: LiveActivity<Props>;
  updates: WidgetUpdates<Props>;
}

const groups = new Map<number, Group>();

const propsOf = (group: Group): Props => {
  const { key, name, scans, image } = group;
  const all = counted(scans);
  const running = isRunning(scans);
  return {
    name,
    status: groupStatus(scans),
    // Ended, the bar fills instead of looping.
    progress: all ? all.done / all.total : running ? null : 1,
    count: all ? `${all.done}/${all.total}` : "",
    icon: ICON,
    stopIcon: STOP_ICON,
    cover: image(group.cover),
    ...widgetMarks(Object.values(group.marks), image),
    covers: [],
    stop: running && scanStops.has(key) ? stopTarget(key) : undefined,
  };
};

const render = (group: Group) => {
  const next = propsOf(group);
  if (isRunning(group.scans)) group.updates.push(next);
  else void group.updates.end(next);
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
  cover,
  sources,
  onStop,
}: ScanActivityArgs): ScanActivity {
  const scan: Scan = { done: 0, total, found: null, source: source?.name };
  // Else iOS suspends the app off screen and every probe in flight fails.
  const task = backgroundTime.begin("Scan sources");
  const { group, running } = joinGroup(groups, mangaId, scan, () => {
    const next: Group = {
      key: String(mangaId),
      name,
      cover,
      scans: [],
      marks: {},
      image: () => undefined,
      updates: updates(undefined),
    };
    next.image = imageLoader(() => render(next));
    return next;
  });
  Object.assign(group.marks, marksById(sources));
  if (onStop) scanStops.set(group.key, onStop);
  if (running) render(group);
  else {
    // An ended Live Activity can't take updates: a new one replaces it.
    void group.activity?.end("immediate").catch(() => {});
    group.activity = start(propsOf(group), `anipoex://manga/${mangaId}`);
    group.updates = updates(group.activity);
  }

  const tracked = trackScan(scan, () => render(group));

  return {
    progress: tracked.progress,
    mark: (id, mark) => {
      setMark(group.marks, id, mark);
      render(group);
    },
    end: (found) => {
      tracked.end(found);
      if (isRunning(group.scans)) return backgroundTime.end(task);
      scanStops.delete(group.key);
      // Kept until the end lands, which waits for the update in flight.
      void group.updates
        .end(propsOf(group))
        .finally(() => backgroundTime.end(task));
    },
  };
}

/**
 * The Reading scan in one Live Activity, showing each manga as it comes; its
 * scans start none of their own. A tap opens the list.
 */
export function startLibraryActivity({
  total,
  onStop,
}: LibraryActivityArgs): LibraryActivity {
  const task = backgroundTime.begin("Scan Reading");
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
      count: `${index}/${total}`,
      icon: ICON,
      stopIcon: STOP_ICON,
      cover: image(view.cover),
      ...widgetMarks(Object.values(view.marks), image),
      library: `Reading · ${index} of ${total} · ${view.newSoFar} new`,
      covers: [],
      stop: stopTarget("library"),
    };
  };
  const render = () => {
    if (!ended) live.push(propsOfView());
  };
  const image = imageLoader(render);
  const live = updates(start(propsOfView(), "anipoex://manga"));

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
      // An ended Live Activity takes no update: its covers are saved first.
      void Promise.all(
        summary.withNew.slice(0, 3).map((m) => widgetImage(m.cover)),
      )
        .then((covers) =>
          live.end({
            name: "Reading",
            status: libraryStatus(summary),
            progress: 1,
            count: `${summary.scanned + summary.recent}/${summary.total}`,
            icon: ICON,
            stopIcon: STOP_ICON,
            marks: [],
            more: 0,
            covers: covers.filter((c): c is string => !!c),
          }),
        )
        .finally(() => backgroundTime.end(task));
    },
  };
}
