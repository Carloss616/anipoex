import type { Observable } from "@legendapp/state";
import { For, useValue } from "@legendapp/state/react";
import { router, usePathname } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { memo } from "react";
import { Pressable, View } from "react-native";
import { PRESS } from "@/components/ui/press";
import { Progress } from "@/components/ui/progress";
import {
  sourceListHref,
  sourceListMangaId,
} from "@/features/manga/utils/source-list-href";
import { type ScanView, scanViews$ } from "../../state/scan-views";

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

  return (
    <Pressable
      onPress={() => onOpen(view.mangaId)}
      accessibilityRole="button"
      accessibilityLabel={`${view.name}, ${view.status}, show sources`}
      className={cn(
        PRESS,
        "glass-chrome hover:glass-muted w-full max-w-sm gap-1 rounded-2xl border p-3 text-start shadow-lg",
      )}
    >
      <Typography type="small" numberOfLines={1}>
        {view.name}
      </Typography>
      <Progress
        label={view.status}
        value={view.progress ?? 0}
        maxValue={1}
        indeterminate={view.progress === null}
        size="sm"
      />
    </Pressable>
  );
});
