import {
  Button,
  HStack,
  LazyHStack,
  Rectangle,
  ScrollView,
  Spacer,
  useNativeState,
  VStack,
  withAnimation,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  Animation,
  accessibilityAddTraits,
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  glassEffect,
  id,
  lineLimit,
  onScrollPhaseChange,
  onTapGesture,
  padding,
  scrollClipDisabled,
  scrollIndicators,
  scrollPosition,
  scrollTargetBehavior,
  scrollTargetLayout,
  textCase,
} from "@expo/ui/swift-ui/modifiers";
import { useIsFocused, useRouter } from "expo-router";
import { memo, useEffect, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { toRouteParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useScreenReader } from "@/hooks/use-screen-reader";
import { ROTATE_MS } from "./constants";
import type { HeroSectionProps } from "./hero-section";

const WIDTH = 300;
const HEIGHT = 210;
const RADIUS = 22;

const renderCard = ({ item, index }: { item: MangaEntry; index: number }) => (
  <HeroCard item={item} rank={index + 1} />
);
const SCRIM = ["#000000b8", "#00000000"];

/**
 * Paging cards: each scroll stops with a card at the gutter, the next peeking.
 * They slide on by themselves; a drag restarts the wait.
 */
export function HeroSection({ title, media, params }: HeroSectionProps) {
  const router = useRouter();
  const seeAllFont = useFont("body");
  const cards = media.slice(0, 10);
  const shown = useRotation(cards.map((item) => String(item.id)));

  return (
    <VStack alignment="leading" spacing={8}>
      <HStack modifiers={[padding({ horizontal: GUTTER })]}>
        <Text textStyle="title3" weight="bold">
          {title}
        </Text>
        <Spacer />
        {params && (
          <Button
            label="See All"
            onPress={() =>
              router.push({
                pathname: "/search",
                params: toRouteParams(params),
              })
            }
            modifiers={[buttonStyle("borderless"), seeAllFont]}
          />
        )}
      </HStack>
      {/* Inset by the gutter and unclipped: `viewAligned` snaps cards to the
          scroller's edge, so that edge is the gutter. */}
      <ScrollView
        axes="horizontal"
        modifiers={[
          scrollIndicators("hidden"),
          scrollTargetBehavior("viewAligned"),
          scrollClipDisabled(),
          padding({ horizontal: GUTTER }),
          scrollPosition(shown.position, { anchor: "leading" }),
          onScrollPhaseChange((phase) => shown.setIdle(phase === "idle")),
        ]}
      >
        <LazyHStack
          spacing={10}
          // A recycled row has no height until a card is measured.
          modifiers={[scrollTargetLayout(), frame({ height: HEIGHT })]}
        >
          <LazyHStack.ForEach
            data={cards}
            keyExtractor={(item) => String(item.id)}
            estimatedItemSize={WIDTH}
          >
            {renderCard}
          </LazyHStack.ForEach>
        </LazyHStack>
      </ScrollView>
    </VStack>
  );
}

/** The card at the gutter, moved on every `ROTATE_MS` while the row rests. */
function useRotation(ids: string[]) {
  const position = useNativeState<string | null>(ids[0] ?? null);
  // A card sliding away would pull it from under VoiceOver's focus.
  const reduced = useReducedMotion();
  const screenReader = useScreenReader();
  const still = reduced || screenReader;
  const focused = useIsFocused();
  const [idle, setIdle] = useState(true);
  // A string, so a new array of the same ids doesn't restart the timer.
  const key = ids.join();

  useEffect(() => {
    const order = key.split(",");
    if (!idle || still || !focused || order.length < 2) return;
    const timer = setInterval(() => {
      const next =
        order[(order.indexOf(position.get() ?? "") + 1) % order.length];
      withAnimation(Animation.smooth(), () => {
        "worklet";
        position.value = next;
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [idle, still, focused, key, position]);

  return { position, setIdle };
}

const HeroCard = memo(function HeroCard({
  item,
  rank,
}: {
  item: MangaEntry;
  rank: number;
}) {
  const router = useRouter();
  const title = item.title?.userPreferred ?? "";
  const cover = item.coverImage?.extraLarge ?? item.coverImage?.large;
  const color = item.coverImage?.color ?? "#808080";

  return (
    <ZStack
      alignment="bottomLeading"
      modifiers={[
        id(String(item.id)),
        frame({ width: WIDTH, height: HEIGHT }),
        clipShape("roundedRectangle", RADIUS),
        glassEffect({
          glass: {
            variant: "regular",
            interactive: true,
            tint: color,
          },
          shape: "roundedRectangle",
          cornerRadius: RADIUS,
        }),
        onTapGesture(() => router.push(`/manga/${item.id}`)),
        accessibilityAddTraits(["isButton"]),
      ]}
    >
      <Rectangle modifiers={[foregroundStyle(color)]} />
      {cover && <Image source={{ uri: cover }} />}
      <Rectangle
        modifiers={[
          foregroundStyle({
            type: "linearGradient",
            colors: SCRIM,
            startPoint: { x: 0.5, y: 1 },
            endPoint: { x: 0.5, y: 0.35 },
          }),
        ]}
      />
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[padding({ horizontal: 16, bottom: 12 })]}
      >
        <Text
          textStyle="caption2"
          weight="semibold"
          modifiers={[foregroundStyle("#ffffffd9"), textCase("uppercase")]}
        >
          #{rank} trending
        </Text>
        <Text
          textStyle="title3"
          weight="semibold"
          modifiers={[foregroundStyle("#ffffff"), lineLimit(2)]}
        >
          {title}
        </Text>
      </VStack>
    </ZStack>
  );
});
