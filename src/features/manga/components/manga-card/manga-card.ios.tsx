import { Spacer } from "@expo/ui";
import { ZStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityElement,
  accessibilityHidden,
  accessibilityIdentifier,
  accessibilityLabel,
  foregroundStyle,
  frame,
  glassEffect,
  onLongPressGesture,
  onTapGesture,
  shadow,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Host, RNHostView, useIsInsideHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { ScrimColumn } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import { CoverImage } from "./components/cover-image";
import { STATUS_COLOR, STATUS_ICON } from "./constants";
import type { MangaCardProps } from "./manga-card";

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
  accessibilityLabel: a11yLabel,
  testID,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const card = useThemeColor("card");
  const isInsideHost = useIsInsideHost();

  const flat = StyleSheet.flatten(style) ?? {};
  const width = dp(flat.width);
  const height = dp(flat.height) ?? (width ? width * (3 / 2) : undefined);

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
          cornerRadius: 24,
        }),
        ...(onPress ? [onTapGesture(onPress)] : []),
        ...(onLongPress ? [onLongPressGesture(onLongPress)] : []),
      ]}
    >
      {cover ? (
        <RNHostView className="flex-1">
          <CoverImage
            // Sized up front when the card knows its size: the host gets its frame from
            // SwiftUI a beat later, and expo-image skips a load while it measures 0×0.
            style={[
              width && height
                ? { position: "absolute", width, height }
                : StyleSheet.absoluteFill,
              { borderRadius: 24 },
            ]}
            cover={cover}
            coverThumb={coverThumb}
            coverColor={coverColor}
          />
        </RNHostView>
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
      {status && (
        <Row
          className="p-2"
          modifiers={[
            frame({
              maxWidth: Infinity,
              maxHeight: Infinity,
              alignment: "topLeading",
            }),
          ]}
        >
          <Badge color={STATUS_COLOR[status]} icon={STATUS_ICON[status]} />
        </Row>
      )}
      <Column className="flex-1">
        <Spacer />
        {titlePosition === "over" && (title || label) && (
          <ScrimColumn className="rounded-[24px] p-2 pt-12">
            <Typography
              type="body-xs"
              numberOfLines={1}
              className="text-center text-gray-50 text-shadow-[0_1px_3px_#000000b3]"
            >
              {label}
            </Typography>
            <Typography
              type="body-sm"
              numberOfLines={2}
              className="text-center text-shadow-[0_1px_3px_#000000b3] text-white"
            >
              {title}
            </Typography>
          </ScrimColumn>
        )}
      </Column>
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
      <Column
        alignment="start"
        className="gap-1.5"
        style={flat}
        modifiers={modifiers}
      >
        <Column
          style={{ width, height }}
          // A faded glow in the cover's color: SwiftUI has no negative spread to tame it.
          modifiers={[
            shadow({
              radius: 9,
              y: 6,
              color: coverColor ? `${coverColor}66` : "#00000000",
            }),
          ]}
        >
          {content}
        </Column>
        <Typography
          type="body-sm"
          weight="semibold"
          numberOfLines={2}
          // Always two lines tall, so captions and bars line up across a row.
          minLines={2}
        >
          {title}
        </Typography>
        <Badge>{label}</Badge>
        {progress != null && <Progress value={progress * 100} size="sm" />}
      </Column>
    ) : (
      <Column style={{ height, ...flat }} modifiers={modifiers}>
        {content}
      </Column>
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

export const MangaCard = withUniwind(MangaCardBase);
