import { ZStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
  opacity,
  strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { useCSSVariable } from "uniwind";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Loader } from "@/components/ui/loader";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import type { SourceTileProps } from "./source-tile";

const SIDE = 40;
/** The loader's circle, as Android's contained loading indicator. */
const RING = 28;

export function SourceTile({
  initials,
  color,
  iconUrl,
  loading = false,
}: SourceTileProps) {
  const [border, popover] = useThemeColor(["border", "popover"]);
  // Each theme family sets its own rounding: read `rounded-lg`, don't fix it.
  const radius = dp(useCSSVariable("--radius-lg") as string | number) ?? 8;
  // The url that loaded, so a recycled row with another source starts over.
  const [loadedUrl, setLoadedUrl] = useState<string>();
  const loaded = !!iconUrl && loadedUrl === iconUrl;
  const dim = loading ? [opacity(0.5)] : [];

  return (
    <ZStack
      modifiers={[
        frame({ width: SIDE, height: SIDE }),
        // Color and outline only frame initials; a loaded logo fills the tile.
        ...(loaded ? [] : [background(color)]),
        clipShape("roundedRectangle", radius),
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
          modifiers={[foregroundStyle("primary"), ...dim]}
        >
          {initials}
        </Text>
      )}
      {iconUrl && (
        <Image
          source={{ uri: iconUrl }}
          modifiers={[frame({ width: SIDE, height: SIDE }), ...dim]}
          onLoad={() => setLoadedUrl(iconUrl)}
        />
      )}
      {loading && (
        <ZStack
          modifiers={[
            frame({ width: RING, height: RING }),
            background(popover),
            clipShape("circle"),
          ]}
        >
          <Loader size="sm" />
        </ZStack>
      )}
    </ZStack>
  );
}
