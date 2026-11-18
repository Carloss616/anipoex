import { Image } from "expo-image";
import { memo, useState } from "react";
import { Pressable } from "react-native";
import type { SourcePage } from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme";
import { PLACEHOLDER_RATIO } from "./constants";
import { usePageUri } from "./hooks/use-page-uri";
import { PageFailed } from "./page-failed";

export interface PageImageProps {
  sourceId: string;
  page: SourcePage;
  /** Shows or hides the reader bar. */
  onPress: () => void;
  /** Reloads the page list: image urls expire, so a plain retry may fail. */
  onRetry: () => void;
}

/**
 * One page at full width, as tall as its image; memoized so the page counter
 * doesn't redraw every visible page.
 */
export const PageImage = memo(function PageImage({
  sourceId,
  page,
  onPress,
  onRetry,
}: PageImageProps) {
  const m3 = useThemeM3Colors();
  const [ratio, setRatio] = useState(PLACEHOLDER_RATIO);
  const { uri, failed, fail } = usePageUri(sourceId, page);

  if (failed)
    return <PageFailed index={page.index} ratio={ratio} onRetry={onRetry} />;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Page ${page.index + 1}`}
      className="bg-muted w-full"
      style={{ aspectRatio: ratio, backgroundColor: m3?.onSurfaceVariant }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="fill"
          style={{ width: "100%", height: "100%" }}
          onLoad={({ source }) => setRatio(source.width / source.height)}
          onError={fail}
        />
      ) : null}
    </Pressable>
  );
});
