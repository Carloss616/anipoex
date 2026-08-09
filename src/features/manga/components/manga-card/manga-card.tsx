import LucideBase from "@react-native-vector-icons/lucide";
import type { ImageSource } from "expo-image";
import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { cn } from "heroui-native/utils";
import {
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { withUniwind } from "uniwind";
import { TouchableNativeFeedback } from "@/components/ui/touchable-native-feedback";
import { CoverImage } from "./components/cover-image";

const Lucide = withUniwind(LucideBase);

export interface MangaCardProps {
  cover?: string | ImageSource | null;
  /** Low-res cover, blown up as a soft preview until `cover` decodes. */
  coverThumb?: string | null;
  coverColor?: string | null;
  title?: string;
  year?: string | number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

/**
 * Also the Android card — there's no Compose sibling, on purpose. `<Host>` on
 * Android is a whole `ComposeView` (its own composition, recomposer and
 * semantics tree), so one per grid cell tanks list scrolling and sizes itself
 * too late for LegendList to place rows.
 *
 * Hence plain RN all the way down, including the pieces that look native-ish:
 * the `scrim` class instead of `<Scrim>`, `<Lucide>` instead of `<Icon>`, and
 * `<TouchableNativeFeedback>` for the ripple — each of those resolves to a
 * Host on Android.
 */
export function MangaCard({
  cover,
  coverThumb,
  coverColor,
  title,
  year,
  style,
  className,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const content = (
    <>
      {cover ? (
        <CoverImage
          style={StyleSheet.absoluteFill}
          cover={cover}
          coverThumb={coverThumb}
          coverColor={coverColor}
        />
      ) : (
        <View
          style={StyleSheet.absoluteFill}
          className="items-center justify-center"
        >
          <Lucide name="book-open" size={22} colorClassName="accent-muted/20" />
        </View>
      )}
      {title && year && (
        <View className="scrim p-2 pt-12">
          <Card.Description
            numberOfLines={1}
            className="text-center text-gray-50 text-shadow-[0_1px_3px_#000000b3] text-xs"
          >
            {year}
          </Card.Description>
          <Card.Title
            numberOfLines={2}
            className="text-center text-shadow-[0_1px_3px_#000000b3] text-sm text-white"
          >
            {title}
          </Card.Title>
        </View>
      )}
    </>
  );

  if (!onPress && !onLongPress)
    return (
      <Card
        style={style}
        className={cn("aspect-2/3 justify-end p-0", className)}
      >
        {content}
      </Card>
    );

  if (Platform.OS === "android")
    return (
      <Card style={style} className={cn("aspect-2/3 p-0", className)}>
        <TouchableNativeFeedback
          onPress={onPress}
          onLongPress={onLongPress}
          useForeground
        >
          <View className="flex-1 justify-end">{content}</View>
        </TouchableNativeFeedback>
      </Card>
    );

  return (
    <Card
      style={style}
      className={cn("aspect-2/3 justify-end p-0", className)}
      asChild
    >
      <PressableFeedback onPress={onPress} onLongPress={onLongPress}>
        {content}
        <PressableFeedback.Highlight />
      </PressableFeedback>
    </Card>
  );
}
