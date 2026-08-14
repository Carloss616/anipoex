import LucideBase from "@react-native-vector-icons/lucide";
import type { ImageSource } from "expo-image";
import { Card } from "heroui-native/card";
import { cn } from "heroui-native/utils";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { Feedback } from "@/components/ui/feedback";
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
 * No Android sibling on purpose: `<Host>` is a whole `ComposeView` there, so one
 * per grid cell tanks scrolling and sizes too late for LegendList. Hence plain RN
 * throughout — `scrim`, `<Lucide>` and `<TouchableNativeFeedback>` instead of
 * `<Scrim>`, `<Icon>` and a Compose ripple, which each resolve to a Host.
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
  return (
    <Feedback
      for={Card}
      onPress={onPress}
      onLongPress={onLongPress}
      className={cn("aspect-2/3 p-0", className)}
      style={style}
    >
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
        <View className="scrim mt-auto p-2 pt-12">
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
    </Feedback>
  );
}
