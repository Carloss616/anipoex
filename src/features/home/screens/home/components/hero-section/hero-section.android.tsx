import { Box, Column } from "@expo/ui/jetpack-compose";
import {
  align,
  background,
  clickable,
  fillMaxSize,
  fillMaxWidth,
  height,
  maskClip,
  matchParentSize,
  padding,
  Shapes,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { GUTTER } from "@/components/native/constants";
import { HorizontalMultiBrowseCarousel } from "@/components/native/jetpack-compose/horizontal-multi-browse-carousel";
import { Image } from "@/components/native/jetpack-compose/image";
import { linearGradient } from "@/components/native/jetpack-compose/linear-gradient";
import { SectionHeader } from "@/components/native/jetpack-compose/section-header";
import { Text } from "@/components/native/jetpack-compose/text";
import { toRouteParams } from "@/features/manga/utils/search-params";
import { useScreenReader } from "@/hooks/use-screen-reader";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ramp } from "@/utils/ramp";
import { ROTATE_MS } from "./constants";
import type { HeroSectionProps } from "./hero-section";

const HEIGHT = 224;
// One large item and one small one peeking, as the mock shows.
const PEEK = 60;
const SCRIM = ramp("#000000", { peak: 0.66 });

/** M3's multi-browse carousel: the large item names the manga, and moves on by itself. */
export function HeroSection({ title, media, params }: HeroSectionProps) {
  const router = useRouter();
  // A card sliding away would pull it from under TalkBack's focus.
  const reduced = useReducedMotion();
  const screenReader = useScreenReader();
  const still = reduced || screenReader;
  const { width } = useWindowDimensions();
  const m3 = useThemeM3Colors();

  return (
    <Column>
      <SectionHeader
        title={title}
        onShowAll={
          params &&
          (() =>
            router.push({ pathname: "/search", params: toRouteParams(params) }))
        }
      />
      <HorizontalMultiBrowseCarousel
        preferredItemWidth={width - GUTTER * 2 - PEEK}
        itemSpacing={8}
        contentPadding={{ start: GUTTER, end: GUTTER }}
        autoAdvanceInterval={still ? 0 : ROTATE_MS}
        modifiers={[fillMaxWidth(), height(HEIGHT)]}
      >
        {media.map((item, i) => {
          const name = item.title?.userPreferred ?? "";
          return (
            <Box
              key={item.id}
              modifiers={[
                fillMaxSize(),
                maskClip(Shapes.RoundedCorner(28)),
                background(
                  item.coverImage?.color ?? m3.surfaceContainerHighest,
                ),
                clickable(() => router.push(`/manga/${item.id}`)),
                semantics({
                  contentDescription: `#${i + 1} trending, ${name}`,
                }),
              ]}
            >
              {item.coverImage?.extraLarge && (
                <Image
                  source={{ uri: item.coverImage.extraLarge }}
                  modifiers={[matchParentSize()]}
                />
              )}
              <Box modifiers={[matchParentSize(), linearGradient(SCRIM)]} />
              <Column
                modifiers={[align("bottomStart"), padding(18, 0, 18, 16)]}
              >
                <Text style={{ typography: "labelMedium" }} color="#ffffffe6">
                  {`#${i + 1} trending`}
                </Text>
                <Text
                  style={{ typography: "titleLarge" }}
                  color="#ffffff"
                  maxLines={2}
                  overflow="ellipsis"
                >
                  {name}
                </Text>
              </Column>
            </Box>
          );
        })}
      </HorizontalMultiBrowseCarousel>
    </Column>
  );
}
