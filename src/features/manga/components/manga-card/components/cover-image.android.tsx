import { Box, Image } from "@expo/ui/jetpack-compose";
import {
  background,
  matchParentSize,
} from "@expo/ui/jetpack-compose/modifiers";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { CoverImageProps } from "./cover-image";

function toSource(cover: CoverImageProps["cover"]) {
  const uri = typeof cover === "string" ? cover : cover?.uri;
  return uri ? { uri } : undefined;
}

export function CoverImage({ cover, coverThumb, coverColor }: CoverImageProps) {
  const m3 = useThemeM3Colors();
  const source = toSource(cover);
  const thumb = toSource(coverThumb);

  return (
    <Box
      modifiers={[
        matchParentSize(),
        background(coverColor ?? m3.surfaceContainerHighest),
      ]}
    >
      {thumb && (
        <Image
          source={thumb}
          contentScale="crop"
          contentDescription={null}
          modifiers={[matchParentSize()]}
        />
      )}
      {source && (
        <Image
          source={source}
          contentScale="crop"
          contentDescription={null}
          modifiers={[matchParentSize()]}
        />
      )}
    </Box>
  );
}
