import type { Observable } from "@legendapp/state";
import { For, useValue } from "@legendapp/state/react";
import { router, usePathname } from "expo-router";
import { Surface } from "panelui-native/components/surface";
import { Typography } from "panelui-native/components/typography";
import { AnimatedPressable } from "panelui-native/primitives/animated-pressable";
import { memo, useEffect } from "react";
import { View } from "react-native";
import { Progress } from "@/components/ui/progress";
import {
  openSheet$,
  type ScanView,
  scanViews$,
  sheetRequest$,
} from "../../state/scan-views";

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
      // The lists' bottom gutter: it clears the floating tab bar.
      className="gutters absolute inset-0 items-center justify-end gap-2 px-gx pb-gb"
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
    <AnimatedPressable
      onPress={() => onOpen(view.mangaId)}
      accessibilityRole="button"
      accessibilityLabel={`${view.name}, ${view.status}, show sources`}
      className="w-full max-w-sm"
    >
      <Surface
        variant="secondary"
        padding="sm"
        className="gap-1"
        bordered
        elevated
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
      </Surface>
    </AnimatedPressable>
  );
});
