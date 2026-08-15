import LucideBase from "@react-native-vector-icons/lucide";
import type { ImageSource } from "expo-image";
import { Card } from "heroui-native/card";
import { cn } from "heroui-native/utils";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import type { MediaStatus } from "@/graphql/types.generated";
import { Badge } from "./components/badge";
import { CoverImage } from "./components/cover-image";
import { Feedback } from "./components/feedback";
import { STATUS_COLOR } from "./constants";

const Lucide = withUniwind(LucideBase);

export interface MangaCardProps {
  cover?: string | ImageSource | null;
  /** Low-res cover, blown up as a soft preview until `cover` decodes. */
  coverThumb?: string | null;
  coverColor?: string | null;
  status?: MediaStatus | null;
  title?: React.ReactNode;
  label?: React.ReactNode;
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
  status,
  title,
  label,
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
      className={cn("relative aspect-2/3 p-0", className)}
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
          <Lucide
            name="book-open"
            size={22}
            colorClassName="accent-muted-foreground/20"
          />
        </View>
      )}
      {status && (
        <Badge color={STATUS_COLOR[status]} className="absolute top-2 right-2">
          {status[0].toUpperCase()}
        </Badge>
      )}
      {(title || label) && (
        <View className="scrim mt-auto p-2 pt-12">
          <Card.Description
            numberOfLines={1}
            className="text-center text-gray-50 text-shadow-[0_1px_3px_#000000b3] text-xs"
          >
            {label}
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
