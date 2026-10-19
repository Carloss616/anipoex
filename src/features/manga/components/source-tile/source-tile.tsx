import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Item } from "@/components/ui/item";
import { Typography } from "@/components/ui/typography";

export interface SourceTileProps {
  initials: string;
  /** The source's own color, per theme mode. */
  color: string;
  /** The source's logo; shown instead of the initials once it loads. */
  iconUrl?: string;
}

/** A source's logo, or its initials on its color, as an item's media. */
export function SourceTile({ initials, color, iconUrl }: SourceTileProps) {
  // The url that loaded, so a recycled row with another source starts over.
  const [loadedUrl, setLoadedUrl] = useState<string>();
  const loaded = !!iconUrl && loadedUrl === iconUrl;

  return (
    <Item.Media
      variant="icon"
      className="overflow-hidden"
      style={{ backgroundColor: color }}
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
    </Item.Media>
  );
}
