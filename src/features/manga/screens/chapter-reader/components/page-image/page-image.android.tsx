import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { Pressable } from "react-native";
import {
  BitmapRegionImage,
  bitmapRegionImageSize,
} from "@/components/native/bitmap-region-image";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { PLACEHOLDER_RATIO } from "./constants";
import { usePageUri } from "./hooks/use-page-uri";
import { PageFailed } from "./page-failed";
import type { PageImageProps } from "./page-image";

interface Size {
  uri: string;
  width: number;
  height: number;
}

/**
 * A page drawn as bands of its file, each decoded alone: a strip 16000px tall
 * decoded whole is a 58 MB bitmap and texture, and a few of them stalled the
 * reader. A file the region decoder can't read (AVIF) is drawn whole.
 */
export const PageImage = memo(function PageImage({
  sourceId,
  page,
  onPress,
  onRetry,
}: PageImageProps) {
  const m3 = useThemeM3Colors();
  const { uri, failed, fail } = usePageUri(sourceId, page);
  const [size, setSize] = useState<Size>();
  // The file drawn whole, after its bands failed.
  const [whole, setWhole] = useState<string>();

  useEffect(() => {
    if (!uri) return;
    let current = true;
    bitmapRegionImageSize(uri).then(
      ({ width, height }) => {
        if (current) setSize({ uri, width, height });
      },
      () => {
        if (current) setWhole(uri);
      },
    );
    return () => {
      current = false;
    };
  }, [uri]);

  const known = uri && size?.uri === uri ? size : undefined;
  const ratio = known ? known.width / known.height : PLACEHOLDER_RATIO;

  if (failed)
    return <PageFailed index={page.index} ratio={ratio} onRetry={onRetry} />;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Page ${page.index + 1}`}
      className="w-full"
      style={{ aspectRatio: ratio, backgroundColor: m3.onSurfaceVariant }}
    >
      {uri && whole === uri ? (
        <Image
          source={{ uri }}
          contentFit="fill"
          style={{ width: "100%", height: "100%" }}
          onLoad={({ source }) =>
            setSize({ uri, width: source.width, height: source.height })
          }
          onError={fail}
        />
      ) : known ? (
        <BitmapRegionImage
          uri={known.uri}
          height={known.height}
          onError={() => setWhole(known.uri)}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </Pressable>
  );
});
