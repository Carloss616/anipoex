import { Spacer } from "@expo/ui";
import { ZStack } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  frame,
  glassEffect,
  onLongPressGesture,
  onTapGesture,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Host, RNHostView, useIsInsideHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { ScrimColumn } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import { Badge } from "./components/badge";
import { CoverImage } from "./components/cover-image";
import { STATUS_COLOR } from "./constants";
import type { MangaCardProps } from "./manga-card";

function MangaCardBase({
  cover,
  coverThumb,
  coverColor,
  status,
  title,
  label,
  style,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const card = useThemeColor("card");
  const isInsideHost = useIsInsideHost();

  const content = (
    <ZStack
      modifiers={[
        glassEffect({
          glass: {
            variant: "regular",
            interactive: !!onPress || !!onLongPress,
            tint: card,
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
      {status && (
        <Row
          className="p-2"
          modifiers={[
            frame({
              maxWidth: Infinity,
              maxHeight: Infinity,
              alignment: "topTrailing",
            }),
          ]}
        >
          <Badge color={STATUS_COLOR[status]}>{status[0].toUpperCase()}</Badge>
        </Row>
      )}
      <Column className="flex-1">
        <Spacer />
        {(title || label) && (
          <ScrimColumn className="rounded-[24px] p-2 pt-12">
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
    /* <Link.Trigger>'s native view keeps a stale ref to its direct child, so it stops mounting
      the card once Fast Refresh remounts it. A host component's type never changes. */
    <View style={style} className="aspect-2/3 rounded-[24px]">
      <Host className="flex-1" ignoreSafeArea="all">
        {content}
      </Host>
    </View>
  );
}

export const MangaCard = withUniwind(MangaCardBase);
