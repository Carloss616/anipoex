import { Image } from "expo-image";
import { Typography } from "panelui-native/components/typography";
import { memo, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { runtime, type SourcePage } from "@/features/extensions";

const PLACEHOLDER_RATIO = 0.7;

export interface PageImageProps {
  sourceId: string;
  page: SourcePage;
  /** Shows or hides the reader bar. */
  onPress: () => void;
  /** Reloads the page list: an image url can expire, so asking for the same one again may not help. */
  onRetry: () => void;
}

/** One page at full width, as tall as its image; memoized so the page counter does not redraw every visible page. */
export const PageImage = memo(function PageImage({
  sourceId,
  page,
  onPress,
  onRetry,
}: PageImageProps) {
  const [ratio, setRatio] = useState(PLACEHOLDER_RATIO);
  // The page that failed: a reload hands new page objects, which mount a fresh image.
  const [failed, setFailed] = useState<SourcePage>();
  // What the source's client fetched (see `runtime.pageImage`), for the page it belongs to; none while it downloads.
  const [image, setImage] = useState<{ page: SourcePage; uri: string }>();
  const label = `Page ${page.index + 1}`;

  useEffect(() => {
    let current = true;
    runtime.pageImage(sourceId, page).then(
      (uri) => {
        if (current) setImage({ page, uri });
      },
      () => {
        if (current) setFailed(page);
      },
    );
    return () => {
      current = false;
    };
  }, [sourceId, page]);
  const uri = image?.page === page ? image.uri : undefined;

  if (failed === page) {
    return (
      <View
        className="w-full items-center justify-center gap-3 bg-muted"
        style={{ aspectRatio: ratio }}
      >
        <Typography type="small" muted>
          Couldn't load page {page.index + 1}
        </Typography>
        <Button variant="secondary" size="sm" onPress={onRetry}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      className="w-full bg-muted"
      style={{ aspectRatio: ratio }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          contentFit="fill"
          style={{ width: "100%", height: "100%" }}
          onLoad={({ source }) => setRatio(source.width / source.height)}
          onError={() => setFailed(page)}
        />
      ) : null}
    </Pressable>
  );
});
