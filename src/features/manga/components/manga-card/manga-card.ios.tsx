import { Spacer } from "@expo/ui";
import { ZStack } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  frame,
  glassEffect,
  onLongPressGesture,
  onTapGesture,
} from "@expo/ui/swift-ui/modifiers";
import { useThemeColor } from "heroui-native/hooks";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { Column } from "@/components/layout/column";
import { Host, RNHostView, useIsInsideHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Scrim } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import { dp } from "@/utils/utils";
import { CoverImage } from "./components/cover-image";
import type { MangaCardProps } from "./manga-card";

/**
 * Stands in for SwiftUI's `.infinity`: a frame clamps `maxWidth` to whatever
 * the parent proposes, so any number past the screen behaves the same — and
 * unlike `Infinity` it survives the props bridge.
 */
const FILL = 100_000;

function MangaCardBase({
  cover,
  coverThumb,
  coverColor,
  title,
  year,
  style,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const [surface, _overlay] = useThemeColor(["surface", "overlay"]);
  const isInsideHost = useIsInsideHost();

  const content = (
    <ZStack
      modifiers={[
        glassEffect({
          glass: {
            variant: "regular",
            interactive: !!onPress || !!onLongPress,
            tint: surface,
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
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
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
      <Column modifiers={[frame({ maxWidth: FILL, maxHeight: FILL })]}>
        <Spacer />
        {title && year && (
          <Scrim className="rounded-3xl p-2 pt-12">
            <Typography
              type="body-xs"
              numberOfLines={1}
              className="text-center text-gray-50"
            >
              {year}
            </Typography>
            <Typography
              type="body-sm"
              numberOfLines={2}
              className="text-center text-white"
            >
              {title}
            </Typography>
          </Scrim>
        )}
      </Column>
    </ZStack>
  );

  if (isInsideHost) {
    const flat = StyleSheet.flatten(style) ?? {};
    const width = dp(flat.width);
    const height = dp(flat.height) ?? (width ? width * (3 / 2) : undefined);

    return <Column style={{ height, ...flat }}>{content}</Column>;
  }

  return (
    <Host style={style} className="aspect-2/3 rounded-3xl" ignoreSafeArea="all">
      {content}
    </Host>
  );
}

export const MangaCard = withUniwind(MangaCardBase);
