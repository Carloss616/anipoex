import type { Observable } from "@legendapp/state";
import { For, useValue } from "@legendapp/state/react";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { memo, useEffect, useRef } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import {
  LegendList,
  type LegendListRef,
} from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { PRESS } from "@/components/ui/press";
import { Progress } from "@/components/ui/progress";
import { SourceTile } from "@/features/manga/components/source-tile";
import { sourceColor } from "@/features/manga/utils/source";
import {
  sourceListHref,
  sourceListMangaId,
} from "@/features/manga/utils/source-list-href";
import { themeMode$ } from "@/state/theme";
import { type ScanView, scanStops, scanViews$ } from "../../state/scan-views";
import type { SourceMark } from "../../utils/scan-activity/utils/marks";

const DETAIL = /^\/manga\/\d+$/;
// The cell's padding (half the gap) is the room the +N badge hangs into: the
// list's cells clip their paint.
const MARK_GAP = 8;
const MARK_SPAN = 40 + MARK_GAP;

/**
 * The running scans over every screen, each hidden while its manga's source
 * list is open; a tap opens that list over the manga's detail.
 */
export function ScanFloat() {
  const pathname = usePathname();
  const covered = sourceListMangaId(pathname);
  const open = (mangaId: number) => {
    const detail = `/manga/${mangaId}` as const;
    if (pathname !== detail) router.navigate(detail);
    router.push(sourceListHref(mangaId));
  };

  return (
    <View
      pointerEvents="box-none"
      // Clears the tab bar, and below lg the detail's floating Continue.
      className={cn(
        "gutters px-gx pb-gb absolute inset-0 items-center justify-end gap-2",
        DETAIL.test(pathname) && "max-lg:pb-[calc(var(--spacing-gb)+3.5rem)]",
      )}
    >
      <For
        each={scanViews$}
        item={ScanCard}
        itemProps={{ onOpen: open, covered }}
      />
    </View>
  );
}

const ScanCard = memo(function ScanCard({
  item$,
  onOpen,
  covered,
}: {
  item$: Observable<ScanView>;
  onOpen: (mangaId: number) => void;
  /** The manga whose source list is open: its views hide under it. */
  covered: number | null;
}) {
  const view = useValue(item$);
  const hidden = view?.mangaId === covered;
  if (!view || hidden) return null;
  const { library } = view;

  return (
    // Stop sits over the card, not in it: a button can't hold another.
    <View className="w-full max-w-sm">
      <Pressable
        onPress={() => onOpen(view.mangaId)}
        accessibilityRole="button"
        accessibilityLabel={`${view.name}, ${view.status}, show sources`}
        className={cn(
          PRESS,
          "glass-chrome hover:glass-muted flex-row gap-3 rounded-2xl border p-3 text-start shadow-lg",
        )}
      >
        <Image
          source={view.cover}
          contentFit="cover"
          style={{ width: 48, minHeight: 72, borderRadius: 6 }}
        />
        <View className="min-w-0 flex-1 gap-2">
          {library && (
            <Typography type="body-xs" muted>
              {`Manga ${library.index} of ${library.total} · ${library.newSoFar} new`}
            </Typography>
          )}
          <Typography type="small" numberOfLines={1}>
            {view.name}
          </Typography>
          {view.marks.length > 0 && <MarkRail marks={view.marks} />}
          <View className="pe-17">
            <Progress
              label={view.status}
              value={view.progress ?? 0}
              maxValue={1}
              indeterminate={view.progress === null}
              size="sm"
            />
          </View>
        </View>
      </Pressable>
      <Button
        variant="destructive"
        size="sm"
        className="absolute inset-e-3 bottom-3"
        aria-label={
          library ? "Stop Reading scan" : `Stop scanning ${view.name}`
        }
        onClick={() =>
          scanStops.get(library ? "library" : String(view.mangaId))?.()
        }
      >
        Stop
      </Button>
    </View>
  );
});

/**
 * The sources in one row, found first; it scrolls itself to the first one
 * scanning, the end of what's done.
 */
function MarkRail({ marks }: { marks: SourceMark[] }) {
  const list = useRef<LegendListRef>(null);
  const focus = marks.findIndex((mark) => mark.state === "scanning");
  useEffect(() => {
    if (focus >= 0)
      void list.current?.scrollToIndex({ index: focus, viewPosition: 0.5 });
  }, [focus]);

  return (
    <LegendList
      ref={list}
      horizontal
      data={marks}
      keyExtractor={(mark) => mark.id}
      estimatedItemSize={MARK_SPAN}
      recycleItems
      columnWrapperStyle={{ gap: MARK_GAP }}
      // The indicator prop does nothing on web, and the badges' overhang
      // would let the row scroll up and down.
      style={
        {
          minWidth: 0,
          minHeight: MARK_SPAN,
          scrollbarWidth: "none",
          overflowY: "hidden",
        } as ViewStyle
      }
      renderItem={({ item }) => <MarkTile mark={item} />}
    />
  );
}

/** A source's tile in its scan state; reads the theme so the card doesn't. */
const MarkTile = memo(function MarkTile({ mark }: { mark: SourceMark }) {
  const mode = useValue(themeMode$);
  const { state, unread } = mark;
  return (
    <View
      role="img"
      accessibilityLabel={`${mark.name}, ${state === "nomatch" ? "no match" : state}`}
      className={cn(
        (state === "pending" || state === "nomatch") && "opacity-40",
      )}
    >
      <SourceTile
        initials={mark.initials}
        iconUrl={mark.iconUrl}
        color={sourceColor(mark, mode)}
        loading={state === "scanning"}
      />
      {state === "found" && !!unread && (
        <Badge color="success" solid className="absolute -inset-e-1 -bottom-1">
          {`+${unread}`}
        </Badge>
      )}
      {state === "error" && (
        <Badge
          color="destructive"
          className="absolute -inset-e-0.5 -bottom-0.5"
        />
      )}
    </View>
  );
});
