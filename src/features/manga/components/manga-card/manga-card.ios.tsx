import { HStack, Rectangle, Spacer, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityElement,
  accessibilityHidden,
  accessibilityIdentifier,
  accessibilityLabel,
  background,
  clipShape,
  fixedSize,
  foregroundStyle,
  frame,
  glassEffect,
  lineLimit,
  multilineTextAlignment,
  onLongPressGesture,
  onTapGesture,
  padding,
  shadow,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Host, useIsInsideHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ramp } from "@/utils/ramp";
import type { MangaCardProps } from "./manga-card";
import { cornerBadge } from "./utils";

/** The cover's corner radius, for placeholders that stand in for a card. */
export const COVER_RADIUS = 24;
const SCRIM = ramp("#000000");
/** Legible on any cover: a light caption over the dark wash. */
const OVER_COVER = [
  multilineTextAlignment("center"),
  shadow({ color: "#000000b3", radius: 3, x: 0, y: 1 }),
  frame({ maxWidth: Infinity }),
];

export function MangaCard({
  cover,
  coverThumb,
  coverColor,
  status,
  mark,
  title,
  label,
  titlePosition = "over",
  progress,
  unread,
  style,
  accessibilityLabel: a11yLabel,
  testID,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const card = useThemeColor("card");
  const corner = cornerBadge(status, mark);
  const [overlay, solid] = useThemeColor(["overlay", "surface-secondary"]);
  const isInsideHost = useIsInsideHost();
  // With its headers: a source's image host can refuse a request without its Referer.
  const coverSource = typeof cover === "string" ? { uri: cover } : cover;

  const flat = StyleSheet.flatten(style) ?? {};
  const width = typeof flat.width === "number" ? flat.width : undefined;
  const height =
    typeof flat.height === "number"
      ? flat.height
      : width
        ? width * (3 / 2)
        : undefined;

  const content = (
    <ZStack
      modifiers={[
        // The card speaks for itself (`accessibilityLabel`); its texts would repeat it.
        ...(a11yLabel ? [accessibilityHidden()] : []),
        glassEffect({
          glass: {
            variant: "regular",
            interactive: !!onPress || !!onLongPress,
            tint: coverColor ?? card,
          },
          shape: "roundedRectangle",
          cornerRadius: COVER_RADIUS,
        }),
        ...(onPress ? [onTapGesture(onPress)] : []),
        ...(onLongPress ? [onLongPressGesture(onLongPress)] : []),
      ]}
    >
      {coverSource?.uri ? (
        // The thumb shows through until the cover fades in over it.
        <ZStack
          modifiers={[
            background(coverColor ?? overlay),
            clipShape("roundedRectangle", COVER_RADIUS),
          ]}
        >
          {coverThumb && <Image source={{ uri: coverThumb }} />}
          <Image source={coverSource} />
        </ZStack>
      ) : (
        <Icon
          name="book"
          size={22}
          modifiers={[
            foregroundStyle({
              type: "hierarchical",
              style: "tertiary",
            }),
          ]}
        />
      )}
      {corner && (
        <HStack
          modifiers={[
            padding({ all: 8 }),
            frame({
              maxWidth: Infinity,
              maxHeight: Infinity,
              alignment: "topLeading",
            }),
          ]}
        >
          <Badge color={corner.color} icon={corner.icon} />
        </HStack>
      )}
      {unread != null && (
        <HStack
          modifiers={[
            padding({ all: 8 }),
            frame({
              maxWidth: Infinity,
              maxHeight: Infinity,
              alignment: "topTrailing",
            }),
          ]}
        >
          {/* Secondary is see-through, made for rows: over a cover it needs a solid fill behind. */}
          <HStack
            modifiers={
              unread === 0 ? [background(solid, shapes.capsule())] : undefined
            }
          >
            <Badge color={unread > 0 ? "success" : "secondary"}>
              {String(unread)}
            </Badge>
          </HStack>
        </HStack>
      )}
      <VStack
        spacing={0}
        modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity })]}
      >
        <Spacer />
        {titlePosition === "over" && (title || label) && (
          // A `Rectangle` takes every point it is offered, so without
          // `fixedSize` the wash would claim the space its content leaves.
          <ZStack
            alignment="bottom"
            modifiers={[
              fixedSize({ horizontal: false, vertical: true }),
              clipShape("roundedRectangle", COVER_RADIUS),
            ]}
          >
            <Rectangle
              modifiers={[
                foregroundStyle({
                  type: "linearGradient",
                  colors: SCRIM.colors,
                  startPoint: { x: 0.5, y: 0 },
                  endPoint: { x: 0.5, y: 1 },
                }),
              ]}
            />
            <VStack
              spacing={0}
              modifiers={[
                padding({ top: 48, leading: 8, trailing: 8, bottom: 8 }),
                frame({ maxWidth: Infinity }),
              ]}
            >
              <Text
                textStyle="caption"
                modifiers={[
                  foregroundStyle("#f9fafb"),
                  lineLimit(1),
                  ...OVER_COVER,
                ]}
              >
                {label}
              </Text>
              <Text
                textStyle="subheadline"
                modifiers={[
                  foregroundStyle("#ffffff"),
                  fixedSize({ horizontal: false, vertical: true }),
                  lineLimit(2),
                  ...OVER_COVER,
                ]}
              >
                {title}
              </Text>
            </VStack>
          </ZStack>
        )}
      </VStack>
    </ZStack>
  );

  const a11y = [
    ...(a11yLabel
      ? [accessibilityElement("ignore"), accessibilityLabel(a11yLabel)]
      : []),
    ...(onPress || onLongPress ? [accessibilityAddTraits(["isButton"])] : []),
    ...(testID ? [accessibilityIdentifier(testID)] : []),
  ];

  // Outside a Host the RN wrapper below speaks for the card.
  const modifiers = isInsideHost ? a11y : undefined;

  // Needs a width in `style`: the cover's height comes from it.
  const body =
    titlePosition === "below" ? (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[...(width ? [frame({ width })] : []), ...(modifiers ?? [])]}
      >
        <VStack
          modifiers={[
            frame({ width, height }),
            // A faded glow in the cover's color: SwiftUI has no negative spread to tame it.
            shadow({
              radius: 9,
              y: 6,
              color: coverColor ? `${coverColor}66` : "#00000000",
            }),
          ]}
        >
          {content}
        </VStack>
        <Text
          textStyle="subheadline"
          weight="semibold"
          modifiers={[
            fixedSize({ horizontal: false, vertical: true }),
            // Always two lines tall, so captions and bars line up across a row.
            lineLimit({ min: 2, max: 2 }),
          ]}
        >
          {title}
        </Text>
        {label && <Badge>{label}</Badge>}
        {progress != null && <Progress value={progress * 100} size="sm" />}
      </VStack>
    ) : (
      <VStack modifiers={[frame({ width, height }), ...(modifiers ?? [])]}>
        {content}
      </VStack>
    );

  if (isInsideHost) return body;

  return (
    /* <Link.Trigger>'s native view keeps a stale ref to its direct child, so it stops mounting
      the card once Fast Refresh remounts it. A host component's type never changes. */
    /* `accessible` makes this a leaf, which is what collapses the stack's text
      children into a single button — and hides their labels along with them, so
      unlike the Host branch the name has to be repeated out here. */
    <View
      style={style}
      accessible={!!a11yLabel}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      testID={testID}
    >
      <Host matchContents={{ vertical: true }} ignoreSafeArea="all">
        {body}
      </Host>
    </View>
  );
}
