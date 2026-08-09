import { Image, type ImageProps, type ImageSource } from "expo-image";
import { useThemeColor } from "heroui-native/hooks";
import { useState } from "react";

/** Enough to smear a ~100px thumb blown up to card width, not so much it greys out. */
const BlurRadius = 8;

export function CoverImage({
  cover,
  coverThumb,
  coverColor,
  style,
}: {
  cover?: string | ImageSource | null;
  coverThumb?: string | null;
  coverColor?: string | null;
  style?: ImageProps["style"];
}) {
  // Which cover, not a boolean: cells recycle, and a stale `true` leaves the next thumb sharp.
  const [displayed, setDisplayed] = useState<string>();
  const overlay = useThemeColor("overlay");
  const uri = typeof cover === "string" ? cover : cover?.uri;

  return (
    <Image
      style={[{ backgroundColor: coverColor ?? overlay }, style]}
      source={cover}
      onDisplay={() => setDisplayed(uri)}
      recyclingKey={uri}
      placeholder={coverThumb ? { uri: coverThumb } : undefined}
      placeholderContentFit="cover"
      contentFit="cover"
      transition={500}
      blurRadius={displayed === uri ? undefined : BlurRadius}
    />
  );
}
