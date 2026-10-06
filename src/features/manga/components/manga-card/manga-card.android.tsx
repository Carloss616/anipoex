import BookIcon from "@expo/material-symbols/book.xml";
import { Box } from "@expo/ui/jetpack-compose";
import {
  align,
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
import { ScrimColumn } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import { dp } from "@/utils/utils";
import { CoverImage } from "./components/cover-image";
import { STATUS_COLOR } from "./constants";
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
  style,
  accessibilityLabel,
  testID,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const isInsideHost = useIsInsideHost();

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
        <Box modifiers={[align("topEnd"), padding(8, 8, 8, 8)]}>
          <Badge color={STATUS_COLOR[status]}>{status[0].toUpperCase()}</Badge>
        </Box>
      )}
      {(title || label) && (
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
      {/* On top: takes the press and carries the name TalkBack reads. */}
      <Box
        modifiers={[
          matchParentSize(),
          ...(accessibilityLabel
            ? [semantics({ contentDescription: accessibilityLabel })]
            : []),
          ...(testID ? [testIDModifier(testID)] : []),
          ...(onPress || onLongPress
            ? [
                combinedClickable({
                  onClick: onPress,
                  onLongClick: onLongPress,
                }),
              ]
            : []),
        ]}
      />
    </Box>
  );

  if (isInsideHost) {
    const flat = StyleSheet.flatten(style) ?? {};
    const width = dp(flat.width);
    const height = dp(flat.height) ?? (width ? width * (3 / 2) : undefined);
    return <Column style={{ ...flat, height }}>{content}</Column>;
  }

  return (
    <Host style={style} className="aspect-2/3">
      {content}
    </Host>
  );
}

export const MangaCard = withUniwind(MangaCardBase);
