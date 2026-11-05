import { useFragment } from "@apollo/client/react";
import {
  HStack,
  LazyHStack,
  ScrollView,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityElement,
  accessibilityLabel,
  background,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  onTapGesture,
  padding,
  scrollIndicators,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Progress } from "@/components/ui/progress";
import type { ContinueItem } from "@/features/home/utils/continue-items";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ContinueSectionProps } from "./continue-section";

const CARD_WIDTH = 240;

export function ContinueSection({ title, items }: ContinueSectionProps) {
  return (
    <VStack alignment="leading" spacing={8}>
      <Text
        textStyle="title3"
        weight="bold"
        modifiers={[padding({ horizontal: GUTTER })]}
      >
        {title}
      </Text>
      <ScrollView axes="horizontal" modifiers={[scrollIndicators("hidden")]}>
        <LazyHStack spacing={10} modifiers={[padding({ horizontal: GUTTER })]}>
          {items.map((item) => (
            <ContinueCard key={item.mangaId} item={item} />
          ))}
        </LazyHStack>
      </ScrollView>
    </VStack>
  );
}

/** Opens the reader at the next chapter; title and progress from the cache. */
const ContinueCard = memo(function ContinueCard({
  item,
}: {
  item: ContinueItem;
}) {
  const router = useRouter();
  const [cell, overlay] = useThemeColor(["muted", "overlay"]);
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: item.mangaId },
  });
  const title = data.title?.userPreferred ?? "";
  const cover = data.coverImage?.medium;
  const read = data.mediaListEntry?.progress ?? 0;
  const caption = `Ch. ${item.next.number} · ${item.unread} new`;

  return (
    <HStack
      spacing={10}
      modifiers={[
        padding({ all: 10 }),
        frame({ width: CARD_WIDTH, alignment: "leading" }),
        background(cell),
        clipShape("roundedRectangle", 18),
        onTapGesture(() =>
          router.push({
            pathname: "/manga/[id]/reader",
            params: { id: item.mangaId, chapter: item.next.id },
          }),
        ),
        accessibilityElement("ignore"),
        accessibilityLabel(`Continue ${title}, ${caption}`),
        accessibilityAddTraits(["isButton"]),
      ]}
    >
      <ZStack
        modifiers={[
          frame({ width: 48, height: 70 }),
          background(data.coverImage?.color ?? overlay),
          clipShape("roundedRectangle", 8),
        ]}
      >
        {cover && <Image source={{ uri: cover }} />}
      </ZStack>
      <VStack alignment="leading" spacing={4}>
        <Text
          textStyle="subheadline"
          weight="semibold"
          modifiers={[lineLimit(2)]}
        >
          {title}
        </Text>
        <Text
          textStyle="caption"
          modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
        >
          {caption}
        </Text>
        <Progress value={(read / (read + item.unread)) * 100} size="sm" />
      </VStack>
    </HStack>
  );
});
