import { useFragment } from "@apollo/client/react";
import {
  Button,
  HStack,
  LazyHStack,
  Rectangle,
  ScrollView,
  Spacer,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  clipShape,
  disabled,
  foregroundStyle,
  frame,
  labelStyle,
  lineLimit,
  onTapGesture,
  padding,
  scrollClipDisabled,
  scrollIndicators,
  scrollTargetBehavior,
  scrollTargetLayout,
  textCase,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useSaveTracking } from "@/features/manga/hooks/use-save-tracking";
import { toRouteParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { MediaListStatus } from "@/graphql/types.generated";
import type { HeroSectionProps } from "./hero-section";

const WIDTH = 300;
const HEIGHT = 210;
const RADIUS = 22;
const SCRIM = ["#000000b8", "#00000000"];

/** Paging cards: each scroll stops with a card at the gutter, the next peeking. */
export function HeroSection({ title, media, params }: HeroSectionProps) {
  const router = useRouter();
  const seeAllFont = useFont("body");

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
        ]}
      >
        <LazyHStack spacing={10} modifiers={[scrollTargetLayout()]}>
          {media.slice(0, 10).map((item, i) => (
            <HeroCard key={item.id} item={item} rank={i + 1} />
          ))}
        </LazyHStack>
      </ScrollView>
    </VStack>
  );
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
            {`#${rank} trending`}
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
            size={BUTTON_ICON_SIZE}
            color="inherit"
            modifiers={[frame({ width: 24, height: 24 })]}
          />
        </Button>
      </HStack>
    </ZStack>
  );
});
