import { useFragment } from "@apollo/client/react";
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
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  clipShape,
  disabled,
  foregroundStyle,
  frame,
  id,
  labelStyle,
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
import { useRouter } from "expo-router";
import { memo, useEffect, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useSaveTracking } from "@/features/manga/hooks/use-save-tracking";
import { toRouteParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { MediaListStatus } from "@/graphql/types.generated";
import { useScreenReader } from "@/hooks/use-screen-reader";
import { ROTATE_MS } from "./constants";
import type { HeroSectionProps } from "./hero-section";

const WIDTH = 300;
const HEIGHT = 210;
const RADIUS = 22;
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
        <LazyHStack spacing={10} modifiers={[scrollTargetLayout()]}>
          {cards.map((item, i) => (
            <HeroCard key={item.id} item={item} rank={i + 1} />
          ))}
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
  const [idle, setIdle] = useState(true);
  // A string, so a new array of the same ids doesn't restart the timer.
  const key = ids.join();

  useEffect(() => {
    const order = key.split(",");
    if (!idle || still || order.length < 2) return;
    const timer = setInterval(() => {
      const next =
        order[(order.indexOf(position.get() ?? "") + 1) % order.length];
      withAnimation(Animation.smooth(), () => {
        "worklet";
        position.value = next;
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [idle, still, key, position]);

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
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: item,
  });
  const { save, saving } = useSaveTracking(item.id);
  const listed = !!data.mediaListEntry;
  const title = item.title?.userPreferred ?? "";
  const cover = item.coverImage?.extraLarge ?? item.coverImage?.large;

  return (
    <ZStack
      alignment="bottomLeading"
      modifiers={[
        id(String(item.id)),
        frame({ width: WIDTH, height: HEIGHT }),
        clipShape("roundedRectangle", RADIUS),
        onTapGesture(() => router.push(`/manga/${item.id}`)),
        accessibilityAddTraits(["isButton"]),
      ]}
    >
      <Rectangle
        modifiers={[foregroundStyle(item.coverImage?.color ?? "#808080")]}
      />
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
      <HStack
        alignment="bottom"
        spacing={12}
        modifiers={[padding({ leading: 16, trailing: 12, bottom: 12 })]}
      >
        <VStack alignment="leading" spacing={2}>
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
        <Spacer />
        <Button
          onPress={() =>
            void save({
              mediaId: item.id,
              status: MediaListStatus.Planning,
              progress: 0,
              score: 0,
              // The error link toasts a failure.
            }).catch(() => {})
          }
          modifiers={[
            buttonStyle("glass"),
            buttonBorderShape("circle"),
            labelStyle("iconOnly"),
            foregroundStyle("#ffffff"),
            disabled(listed || saving),
            accessibilityLabel(
              listed ? `${title} is on your list` : `Add ${title} to Planning`,
            ),
          ]}
        >
          <Icon
            name={listed ? Icons.check : Icons.add}
            color="inherit"
            modifiers={[frame({ width: 24, height: 24 })]}
          />
        </Button>
      </HStack>
    </ZStack>
  );
});
