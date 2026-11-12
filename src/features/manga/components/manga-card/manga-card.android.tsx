import { Box, Column } from "@expo/ui/jetpack-compose";
import {
  align,
  clickable,
  clip,
  combinedClickable,
  fillMaxSize,
  fillMaxWidth,
  height as heightModifier,
  matchParentSize,
  padding,
  Shapes,
  semantics,
  testID as testIDModifier,
  width as widthModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";
import { linearGradient } from "@/components/native/jetpack-compose/linear-gradient";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Host, useIsInsideHost } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import { ramp } from "@/utils/ramp";
import { CoverImage } from "./cover-image";
import type { MangaCardProps } from "./manga-card";
import { cornerBadge } from "./utils";

/** The cover's corner radius, for placeholders that stand in for a card. */
export const COVER_RADIUS = 12;
/** Legible on any cover: a light caption over the dark wash. */
const SHADOW = { color: "#000000b3", offsetX: 0, offsetY: 1, blurRadius: 3 };
const SCRIM = ramp("#000000");

/**
 * Compose card, meant to sit inside a Host. Standalone it brings its own,
 * too heavy to repeat in an RN list.
 */
export function MangaCard({
  cover,
  coverThumb,
  coverColor,
  status,
  mark,
  title,
  label,
  titlePosition = "split",
  progress,
  unread,
  scanning = false,
  style,
  radius = COVER_RADIUS,
  accessibilityLabel,
  testID,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const isInsideHost = useIsInsideHost();
  const corner = cornerBadge(status, mark);

  // On top of the cover: takes the press and carries the name TalkBack reads.
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
      modifiers={[fillMaxSize(), clip(Shapes.RoundedCorner(radius))]}
    >
      <Box contentAlignment="center" modifiers={[matchParentSize()]}>
        {cover ? (
          <CoverImage
            cover={cover}
            coverThumb={coverThumb}
            coverColor={coverColor}
          />
        ) : (
          <Icon name={Icons.cover} size={22} muted />
        )}
      </Box>
      {corner && (
        <Box modifiers={[align("topStart"), padding(8, 8, 8, 8)]}>
          <Badge color={corner.color} icon={corner.icon} />
        </Box>
      )}
      {(scanning || unread != null) && (
        <Box modifiers={[align("topEnd"), padding(8, 8, 8, 8)]}>
          {scanning ? (
            <Loader size="sm" />
          ) : (
            unread != null && (
              <Badge color={unread > 0 ? "success" : "secondary"}>
                {String(unread)}
              </Badge>
            )
          )}
        </Box>
      )}
      {titlePosition === "split" && label && (
        <Box modifiers={[align("bottomCenter"), padding(8, 8, 8, 8)]}>
          <Badge>{label}</Badge>
        </Box>
      )}
      {titlePosition === "over" && (title || label) && (
        <Box modifiers={[matchParentSize()]} contentAlignment="bottomCenter">
          <Box modifiers={[fillMaxWidth()]}>
            {/* `matchParentSize` keeps the ramp out of the box's measurement,
                so the text is what sets the height. */}
            <Column modifiers={[matchParentSize(), linearGradient(SCRIM)]} />
            <Column
              horizontalAlignment="center"
              verticalArrangement={{ spacedBy: 4 }}
              modifiers={[fillMaxWidth(), padding(8, 48, 8, 8)]}
            >
              {label && <Badge>{label}</Badge>}
              <Text
                style={{
                  typography: "bodyMedium",
                  textAlign: "center",
                  shadow: SHADOW,
                }}
                color="#ffffff"
                maxLines={2}
                overflow="ellipsis"
                modifiers={[fillMaxWidth()]}
              >
                {title}
              </Text>
            </Column>
          </Box>
        </Box>
      )}
      {overlay}
    </Box>
  );

  const flat = StyleSheet.flatten(style) ?? {};
  const width = typeof flat.width === "number" ? flat.width : undefined;
  const height =
    typeof flat.height === "number"
      ? flat.height
      : width
        ? width * (3 / 2)
        : undefined;
  const sized = [
    ...(width ? [widthModifier(width)] : []),
    ...(height ? [heightModifier(height)] : []),
  ];

  // Needs a width in `style`: Compose has no `aspectRatio` to size the cover.
  const body =
    titlePosition !== "over" ? (
      <Column
        verticalArrangement={{ spacedBy: 6 }}
        modifiers={width ? [widthModifier(width)] : []}
      >
        <Column modifiers={sized}>{content}</Column>
        <Text
          style={{ typography: "bodyMedium", fontWeight: "600" }}
          maxLines={2}
          minLines={2}
          overflow="ellipsis"
          modifiers={[
            fillMaxWidth(),
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
        >
          {title}
        </Text>
        {label && titlePosition === "below" && <Badge>{label}</Badge>}
        {progress != null && <Progress value={progress * 100} size="sm" />}
      </Column>
    ) : (
      <Column modifiers={sized}>{content}</Column>
    );

  if (isInsideHost) return body;

  return (
    <Host style={style} matchContents={{ vertical: true }}>
      {body}
    </Host>
  );
}
