import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";

export interface ReaderBarProps {
  /** "Chapter 13". */
  chapter: string;
  /** "<manga> · <source>". */
  subtitle: string;
  visible: boolean;
  /** The page at the top of the screen, from 1. */
  page: number;
  count: number;
  onBack: () => void;
}

/** The bar over the pages and the page count under them; a tap on a page toggles both. */
export function ReaderBar({
  chapter,
  subtitle,
  visible,
  page,
  count,
  onBack,
}: ReaderBarProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <>
      <View
        className="absolute inset-x-0 top-0 flex-row items-center gap-2 bg-background/88 px-2 pb-2 backdrop-blur-xl"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onPress={onBack}
          accessibilityLabel="Back"
        >
          <Icon name={Icons.back} size={BUTTON_ICON_SIZE} />
        </Button>
        <View className="min-w-0 flex-1">
          <Typography type="body-sm" weight="semibold" numberOfLines={1}>
            {chapter}
          </Typography>
          <Typography type="body-xs" muted numberOfLines={1}>
            {subtitle}
          </Typography>
        </View>
      </View>
      {count > 0 && (
        <View
          className="pointer-events-none absolute inset-x-0 items-center"
          style={{ bottom: insets.bottom + 24 }}
        >
          <View className="rounded-full bg-background/88 px-3 py-1.5">
            <Typography type="body-xs" muted>
              {page} / {count}
            </Typography>
          </View>
        </View>
      )}
    </>
  );
}
