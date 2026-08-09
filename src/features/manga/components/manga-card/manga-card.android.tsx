import {
  Box,
  Card,
  Column as ColumnNative,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import {
  combinedClickable,
  fillMaxHeight,
  fillMaxWidth,
} from "@expo/ui/jetpack-compose/modifiers";
import { Image } from "expo-image";
import { useThemeColor } from "heroui-native/hooks";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { Column } from "@/components/layout/column";
import { Host, RNHostView, useIsInsideHost } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Scrim } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import { dp } from "@/utils/utils";
import { BlurHash, BookIcon } from "./constants";
import type { MangaCardProps } from "./manga-card";

function MangaCardBase({
  cover,
  title,
  year,
  style,
  onPress,
  onLongPress,
}: MangaCardProps) {
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });
  const isInsideHost = useIsInsideHost();

  const content = (
    <Card>
      <Box contentAlignment="center">
        {cover ? (
          <RNHostView className="flex-1">
            <Image
              style={StyleSheet.absoluteFill}
              source={cover}
              recyclingKey={typeof cover === "string" ? cover : undefined}
              placeholder={{ blurhash: BlurHash }}
              contentFit="cover"
              transition={500}
            />
          </RNHostView>
        ) : (
          <Icon name={BookIcon} size={22} color={m3.outline} />
        )}
        <ColumnNative
          modifiers={[fillMaxWidth(), fillMaxHeight()]}
          verticalArrangement="bottom"
        >
          {title && year && (
            <Scrim className="p-2 pt-12">
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
        </ColumnNative>
        {(onPress || onLongPress) && (
          <Box
            modifiers={[
              fillMaxWidth(),
              fillMaxHeight(),
              combinedClickable({
                onClick: onPress,
                onLongClick: onLongPress,
              }),
            ]}
          />
        )}
      </Box>
    </Card>
  );

  if (isInsideHost) {
    const flat = StyleSheet.flatten(style) ?? {};
    const width = dp(flat.width);
    const height = dp(flat.height) ?? (width ? width * (3 / 2) : undefined);

    return <Column style={{ height, ...flat }}>{content}</Column>;
  }

  return (
    <Host style={style} className="aspect-2/3">
      {content}
    </Host>
  );
}

export const MangaCard = withUniwind(MangaCardBase);
