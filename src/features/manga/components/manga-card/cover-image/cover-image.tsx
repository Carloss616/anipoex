import { Image, type ImageProps, type ImageSource } from "expo-image";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface CoverImageProps {
  cover?: string | ImageSource | null;
  coverThumb?: string | null;
  coverColor?: string | null;
  style?: ImageProps["style"];
}

export function CoverImage({
  cover,
  coverThumb,
  coverColor,
  style,
}: CoverImageProps) {
  const overlay = useThemeColor("overlay");
  const uri = typeof cover === "string" ? cover : cover?.uri;

  return (
    <Image
      style={[{ backgroundColor: coverColor ?? overlay }, style]}
      source={cover}
      recyclingKey={uri}
      placeholder={coverThumb ? { uri: coverThumb } : undefined}
      placeholderContentFit="cover"
      contentFit="cover"
      transition={250}
    />
  );
}
