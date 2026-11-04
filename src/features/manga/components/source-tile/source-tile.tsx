import { Image } from "expo-image";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export interface SourceTileProps {
  initials: string;
  /** The source's own color, per theme mode. */
  color: string;
  /** The source's logo; shown instead of the initials once it loads. */
  iconUrl?: string;
}

/** A source's logo, or its initials on its color, for a `Frame.Media`. */
export function SourceTile({ initials, color, iconUrl }: SourceTileProps) {
  // The url that loaded, so a recycled row with another source starts over.
  const [loadedUrl, setLoadedUrl] = useState<string>();
  const loaded = !!iconUrl && loadedUrl === iconUrl;

  return (
    <View
      // Color and outline only frame initials; a loaded logo fills the tile.
      className={cn(
        "size-10 items-center justify-center overflow-hidden rounded-lg",
        !loaded && "border border-border",
      )}
      style={loaded ? undefined : { backgroundColor: color }}
    >
      {!loaded && (
        <Typography type="body-xs" weight="semibold">
          {initials}
        </Typography>
      )}
      {iconUrl && (
        <Image
          source={iconUrl}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          onLoad={() => setLoadedUrl(iconUrl)}
        />
      )}
    </View>
  );
}
