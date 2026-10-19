import { ZStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
  strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { Image } from "expo-image";
import { useState } from "react";
import { useCSSVariable } from "uniwind";
import { Text } from "@/components/native/swift-ui/text";
import { RNHostView } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import type { SourceTileProps } from "./source-tile";

const SIDE = 40;

export function SourceTile({ initials, color, iconUrl }: SourceTileProps) {
  const border = useThemeColor("border");
  // Each theme family sets its own rounding, so `rounded-lg` is read, not fixed.
  const radius = dp(useCSSVariable("--radius-lg") as string | number) ?? 8;
  // The url that loaded, so a recycled row with another source starts over.
  const [loadedUrl, setLoadedUrl] = useState<string>();
  const loaded = !!iconUrl && loadedUrl === iconUrl;

  return (
    <ZStack
      modifiers={[
        frame({ width: SIDE, height: SIDE }),
        background(color),
        clipShape("roundedRectangle", radius),
        // The outline only frames the initials; a loaded logo fills the tile.
        ...(loaded
          ? []
          : [
              strokeBorder({
                content: border,
                shape: "roundedRectangle",
                cornerRadius: radius,
              }),
            ]),
      ]}
    >
      {!loaded && (
        // Its own color: as a `Label` icon in a `List` it would take the tint.
        <Text
          textStyle="caption"
          weight="semibold"
          modifiers={[foregroundStyle("primary")]}
        >
          {initials}
        </Text>
      )}
      {iconUrl && (
        <RNHostView>
          <Image
            // Sized up front: expo-image skips a load while it measures 0×0.
            style={{ width: SIDE, height: SIDE }}
            source={iconUrl}
            contentFit="cover"
            onLoad={() => setLoadedUrl(iconUrl)}
          />
        </RNHostView>
      )}
    </ZStack>
  );
}
