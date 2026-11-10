import type { Observable } from "@legendapp/state";
import { For, useValue } from "@legendapp/state/react";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { memo } from "react";
import { Pressable, View } from "react-native";
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
          {view.marks.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5">
              {view.marks.map((mark) => (
                <MarkTile key={mark.id} mark={mark} />
              ))}
            </View>
          )}
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
