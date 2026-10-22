import { Box } from "@expo/ui/jetpack-compose";
import {
  background,
  matchParentSize,
} from "@expo/ui/jetpack-compose/modifiers";
import { Image } from "@/components/native/jetpack-compose/image";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { CoverImageProps } from "./cover-image";

// With its headers: a source's image host can refuse a request without its Referer.
function toSource(cover: CoverImageProps["cover"]) {
  return typeof cover === "string" ? { uri: cover } : cover;
}

export function CoverImage({ cover, coverThumb, coverColor }: CoverImageProps) {
  const m3 = useThemeM3Colors();
  const source = toSource(cover);

  return (
    <Box
      modifiers={[
        matchParentSize(),
        background(coverColor ?? m3.surfaceContainerHighest),
      ]}
    >
      {coverThumb && (
        <Image source={{ uri: coverThumb }} modifiers={[matchParentSize()]} />
      )}
      {source?.uri && <Image source={source} modifiers={[matchParentSize()]} />}
    </Box>
  );
}
