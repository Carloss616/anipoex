import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { SourcePage } from "@/features/extensions";

const PLACEHOLDER_RATIO = 0.7;

export interface PageImageProps {
  page: SourcePage;
  /** Shows or hides the reader bar. */
  onPress: () => void;
  /** Reloads the page list: an image url can expire, so asking for the same one again may not help. */
  onRetry: () => void;
}

/** One page at full width, as tall as its image. */
export function PageImage({ page, onPress, onRetry }: PageImageProps) {
  const [ratio, setRatio] = useState(PLACEHOLDER_RATIO);
  // The page that failed: a reload hands new page objects, which mount a fresh image.
  const [failed, setFailed] = useState<SourcePage>();
  const label = `Page ${page.index + 1}`;

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
      <Image
        source={{
          uri: page.imageUrl,
          // On web any `headers` turn the <img> into a CORS fetch, which the desktop's page scheme refuses; it sends none.
          headers: Object.keys(page.headers).length ? page.headers : undefined,
        }}
        contentFit="fill"
        style={{ width: "100%", height: "100%" }}
        onLoad={({ source }) => setRatio(source.width / source.height)}
        onError={() => setFailed(page)}
      />
    </Pressable>
  );
}
