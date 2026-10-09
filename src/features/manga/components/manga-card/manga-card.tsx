import type { ImageSource } from "expo-image";
import { Card } from "panelui-native/components/card";
import { cn } from "panelui-native/utils/cn";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { EnsureRNHostView, useIsInsideHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { ScrimGradient } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import type { TitlePosition } from "@/features/manga/utils/list-view";
import type { MediaStatus } from "@/graphql/types.generated";
import { dp } from "@/utils/utils";
import { CoverImage } from "./components/cover-image";
import { STATUS_COLOR, STATUS_ICON } from "./constants";

export interface MangaCardProps {
  cover?: string | ImageSource | null;
  /** Low-res cover, blown up as a soft preview until `cover` decodes. */
  coverThumb?: string | null;
  coverColor?: string | null;
  status?: MediaStatus | null;
  title?: string | null;
  label?: string | null;
  /** Where `title` and `label` go. `over` keeps them on a scrim over the cover. */
  titlePosition?: TitlePosition;
  /** Share read, 0–1; draws a bar under the label. Omit when the total is unknown. */
  progress?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Spoken name for the card — `title` is a node, so it can't be read off it. */
  accessibilityLabel?: string;
  testID?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

/** The web card. iOS and Android draw their own, inside the native grid's single Host. */
export function MangaCard({
  cover,
  coverThumb,
  coverColor,
  status,
  title,
  label,
  titlePosition = "over",
  progress,
  style,
  className,
  accessibilityLabel,
  testID,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const isInsideHost = useIsInsideHost();

  // `matchContents` measures the card without resolving its aspect ratio, so inside a
  // host it comes out 0 tall. Spell the height out, the way the iOS card does.
  const flat = StyleSheet.flatten(style) ?? {};
  const width = dp(flat.width);
  const height = dp(flat.height) ?? (width ? width * (3 / 2) : undefined);
  const sized = isInsideHost && height ? { ...flat, height } : style;

  const art = cover ? (
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
      <Icon name="book-open" size={22} className="text-muted-foreground/20" />
    </View>
  );
  // An icon, not a word: it has to fit a narrow cover. The list only tags the
  // exceptions (see `ListItem`), and the card's spoken label names the status.
  const badge = status && (
    <Badge
      color={STATUS_COLOR[status]}
      icon={STATUS_ICON[status]}
      className="absolute top-2 left-2"
    />
  );

  if (titlePosition === "below") {
    return (
      <EnsureRNHostView matchContents>
        <Feedback onPress={onPress} onLongPress={onLongPress}>
          <View
            accessible={!!accessibilityLabel}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            className={cn(
              "w-full gap-2",
              (onPress || onLongPress) && "web:cursor-pointer",
              className,
            )}
            style={style}
          >
            <Card
              className="relative aspect-2/3 w-full overflow-hidden rounded-[10px] border-0 p-0"
              // The cover glows in its own AniList color.
              style={{
                boxShadow: `0 8px 18px -8px ${coverColor ?? "transparent"}`,
              }}
            >
              {art}
              {badge}
            </Card>
            <Typography
              type="body-sm"
              weight="semibold"
              numberOfLines={2}
              // Always two lines tall (body-sm is 20px), so captions and bars line up across a row.
              className="min-h-10"
            >
              {title}
            </Typography>
            <Badge className="self-start">{label}</Badge>
            {progress != null && <Progress value={progress * 100} size="sm" />}
          </View>
        </Feedback>
      </EnsureRNHostView>
    );
  }

  return (
    <EnsureRNHostView matchContents>
      <Feedback onPress={onPress} onLongPress={onLongPress}>
        <Card
          accessible={!!accessibilityLabel}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          testID={testID}
          className={cn(
            "relative aspect-2/3 overflow-hidden android:rounded-[12px] border-0 p-0",
            (onPress || onLongPress) && "web:cursor-pointer",
            className,
          )}
          style={sized}
        >
          {art}
          {badge}
          {titlePosition === "over" && (title || label) && (
            <View className="mt-auto p-2 pt-12">
              <ScrimGradient
                colorClassName="accent-black"
                style={StyleSheet.absoluteFill}
              />
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
        </Card>
      </Feedback>
    </EnsureRNHostView>
  );
}
