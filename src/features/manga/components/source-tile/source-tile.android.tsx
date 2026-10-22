import { Box } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  matchParentSize,
  paddingAll,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { useCSSVariable } from "uniwind";
import { Image } from "@/components/native/jetpack-compose/image";
import { Text } from "@/components/native/jetpack-compose/text";
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
    <Box
      contentAlignment="center"
      modifiers={[
        size(SIDE, SIDE),
        clip(Shapes.RoundedCorner(radius)),
        // Compose's `border()` takes no shape: the border is the color showing through a hairline gap, dropped once loaded.
        ...(loaded
          ? []
          : [
              background(border),
              paddingAll(1),
              clip(Shapes.RoundedCorner(radius - 1)),
              background(color),
            ]),
      ]}
    >
      {!loaded && (
        <Text style={{ typography: "bodySmall", fontWeight: "600" }}>
          {initials}
        </Text>
      )}
      {iconUrl && (
        <Image
          source={{ uri: iconUrl }}
          onLoad={() => setLoadedUrl(iconUrl)}
          modifiers={[matchParentSize()]}
        />
      )}
    </Box>
  );
}
