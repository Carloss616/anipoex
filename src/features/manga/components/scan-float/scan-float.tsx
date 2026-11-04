import type { Observable } from "@legendapp/state";
import { For, useValue } from "@legendapp/state/react";
import { router, usePathname } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { memo, useEffect } from "react";
import { Pressable, View } from "react-native";
import { PRESS } from "@/components/ui/press";
import { Progress } from "@/components/ui/progress";
import {
  openSheet$,
  type ScanView,
  scanViews$,
  sheetRequest$,
} from "../../state/scan-views";

const DETAIL = /^\/manga\/\d+$/;

/** The running scans over every screen, each hidden while its manga's source sheet is open; a tap opens that sheet. */
export function ScanFloat() {
  const pathname = usePathname();
  const open = (mangaId: number) => {
    sheetRequest$.set(mangaId);
    const href = `/manga/${mangaId}` as const;
    if (pathname !== href) router.navigate(href);
  };
  // A request the sheet never took (its page failed to load) is dropped on
  // leaving that page, so a later visit doesn't open the sheet by itself.
  useEffect(() => {
    const requested = sheetRequest$.peek();
    if (requested !== null && pathname !== `/manga/${requested}`)
      sheetRequest$.set(null);
  }, [pathname]);

  return (
    <View
      pointerEvents="box-none"
      // Clears the tab bar, and below lg the detail's floating Continue.
      className={cn(
        "gutters absolute inset-0 items-center justify-end gap-2 px-gx pb-gb",
        DETAIL.test(pathname) && "max-lg:pb-[calc(var(--spacing-gb)+3.5rem)]",
      )}
    >
      <For each={scanViews$} item={ScanCard} itemProps={{ onOpen: open }} />
    </View>
  );
}

const ScanCard = memo(function ScanCard({
  item$,
  onOpen,
}: {
  item$: Observable<ScanView>;
  onOpen: (mangaId: number) => void;
}) {
  const view = useValue(item$);
  const hidden = useValue(() => openSheet$.get() === item$.mangaId.get());
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
