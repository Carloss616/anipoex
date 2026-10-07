import BookIcon from "@expo/material-symbols/book.xml";
import { Box } from "@expo/ui/jetpack-compose";
import {
  align,
  clickable,
  clip,
  combinedClickable,
  fillMaxSize,
  matchParentSize,
  padding,
  Shapes,
  semantics,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { Column } from "@/components/layout/column";
import { Badge } from "@/components/ui/badge";
import { Host, useIsInsideHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { ScrimColumn } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import { dp } from "@/utils/utils";
import { CoverImage } from "./components/cover-image";
import { STATUS_COLOR, STATUS_ICON } from "./constants";
import type { MangaCardProps } from "./manga-card";

const RADIUS = 12;

/**
 * Compose card, meant to sit inside a Host. Standalone it brings its own,
 * too heavy to repeat in an RN list.
 */
function MangaCardBase({
  cover,
  coverThumb,
  coverColor,
  status,
  title,
  label,
  titlePosition = "over",
  progress,
  style,
  accessibilityLabel,
  testID,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const isInsideHost = useIsInsideHost();

  // On top: takes the press and carries the name TalkBack reads.
  const overlay = (
    <Box
      modifiers={[
        matchParentSize(),
        ...(accessibilityLabel
          ? [semantics({ contentDescription: accessibilityLabel })]
          : []),
        ...(testID ? [testIDModifier(testID)] : []),
        // `combinedClickable` always reports a long-click action to TalkBack.
        ...(onLongPress
          ? [
              combinedClickable({
                onClick: onPress,
                onLongClick: onLongPress,
              }),
            ]
          : onPress
            ? [clickable(onPress)]
            : []),
      ]}
    />
  );

  const content = (
    <Box
      contentAlignment="center"
      modifiers={[fillMaxSize(), clip(Shapes.RoundedCorner(RADIUS))]}
    >
      {cover ? (
        <CoverImage
          cover={cover}
          coverThumb={coverThumb}
          coverColor={coverColor}
        />
      ) : (
        <Icon name={BookIcon} size={22} muted />
      )}
      {status && (
        <Box modifiers={[align("topStart"), padding(8, 8, 8, 8)]}>
          <Badge color={STATUS_COLOR[status]} icon={STATUS_ICON[status]} />
        </Box>
      )}
      {titlePosition === "over" && (title || label) && (
        <Box modifiers={[matchParentSize()]} contentAlignment="bottomCenter">
          <ScrimColumn className="p-2 pt-12" alignment="center">
            <Typography
              type="body-xs"
              numberOfLines={1}
              className="text-center text-gray-50"
            >
              {label}
            </Typography>
            <Typography
              type="body-sm"
              numberOfLines={2}
              className="text-center text-white"
            >
              {title}
            </Typography>
          </ScrimColumn>
        </Box>
      )}
      {titlePosition === "over" && overlay}
    </Box>
  );

  const flat = StyleSheet.flatten(style) ?? {};
  const width = dp(flat.width);
  const height = dp(flat.height) ?? (width ? width * (3 / 2) : undefined);

  // Needs a width in `style`: Compose has no `aspectRatio`, so the cover's height comes from it.
  const body =
    titlePosition === "below" ? (
      // A Box so the press overlay can cover the cover and the texts alike.
      <Box>
        <Column className="gap-1.5" style={{ width: flat.width }}>
          <Column style={{ width: flat.width, height }}>{content}</Column>
          <Typography
            type="body-sm"
            weight="semibold"
            numberOfLines={2}
            // Always two lines tall, so captions and bars line up across a row.
            minLines={2}
          >
            {title}
          </Typography>
          <Typography type="body-xs" muted numberOfLines={1}>
            {label}
          </Typography>
          {progress != null && <Progress value={progress * 100} size="sm" />}
        </Column>
        {overlay}
      </Box>
    ) : (
      <Column style={{ ...flat, height }}>{content}</Column>
    );

  if (isInsideHost) return body;

  return (
    <Host style={style} matchContents={{ vertical: true }}>
      {body}
    </Host>
  );
}

export const MangaCard = withUniwind(MangaCardBase);
