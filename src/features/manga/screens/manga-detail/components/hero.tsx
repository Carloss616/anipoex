import { Image } from "expo-image";
import { useAnimatedHeaderHeight } from "expo-router/native-stack";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { EnsureRNHostView } from "@/components/ui/host";
import { ScrimGradient } from "@/components/ui/scrim";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { smootherstep } from "@/utils/ramp";

/**
 * The art left standing *below* the header, not the frame's total height — the
 * header is a different size on every platform, so a fixed total would leave a
 * different hero on each.
 */
export const ART_HEIGHT = 200;

/**
 * Cover art behind the header. `maxHeaderHeight` comes from the screen (see
 * `useMaxHeaderHeight`), so a pull doesn't re-render it.
 */
export function Hero({
  manga,
  maxHeaderHeight,
}: {
  manga: MangaDetail;
  maxHeaderHeight: number;
}) {
  const headerHeight = useAnimatedHeaderHeight();
  const height = maxHeaderHeight + ART_HEIGHT;
  // Grows from its bottom by as much as a pull stretches the large title, on
  // the native driver: a transform, so the list never relays out mid-pull.
  const scale = headerHeight.interpolate({
    inputRange: [maxHeaderHeight, maxHeaderHeight + height],
    outputRange: [1, 2],
    extrapolateLeft: "clamp",
  });
  const banner = manga.bannerImage;
  const art = banner ?? manga.coverImage?.extraLarge;
  if (!art) return null;

  return (
    <EnsureRNHostView matchContents={{ vertical: true }} className="w-full">
      <View className="w-full" style={{ height }}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            // Only iOS stretches its header.
            Platform.OS === "ios" && {
              transformOrigin: "bottom",
              transform: [{ scale }],
            },
          ]}
        >
          <Image
            source={art}
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: manga.coverImage?.color ?? undefined,
              },
            ]}
            contentFit="cover"
            transition={400}
            blurRadius={Platform.select({
              ios: 8,
              web: 4,
              default: 2,
            })}
          />
          <ScrimGradient
            ease={smootherstep}
            style={StyleSheet.absoluteFill}
            flip
          />
          <ScrimGradient
            peak={1}
            ease={smootherstep}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </EnsureRNHostView>
  );
}
