import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";
import { ScrimGradient } from "@/components/ui/scrim";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useMaxHeaderHeight } from "@/hooks/use-max-header-height";
import { smootherstep } from "@/utils/ramp";

/**
 * The art left standing *below* the header, not the frame's total height — the
 * header is a different size on every platform, so a fixed total would leave a
 * different hero on each.
 */
const ART_HEIGHT = 200;

/** Cover art behind the header. */
export function Hero({ manga }: { manga: MangaDetail }) {
  const maxHeaderHeight = useMaxHeaderHeight();
  const banner = manga.bannerImage;
  const art = banner ?? manga.coverImage?.extraLarge;
  if (!art) return null;

  return (
    <View
      className="w-full"
      style={{
        height: maxHeaderHeight + ART_HEIGHT,
        // Only iOS: elsewhere `headerTransparent` already positions it absolutely.
        marginTop: Platform.OS === "ios" ? -maxHeaderHeight : 0,
        marginBottom: -ART_HEIGHT,
      }}
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
      <ScrimGradient ease={smootherstep} style={StyleSheet.absoluteFill} flip />
      <ScrimGradient
        peak={1}
        ease={smootherstep}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
