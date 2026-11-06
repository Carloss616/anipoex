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
  accessibilityHidden,
  accessibilityLabel,
  background,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  onTapGesture,
  padding,
  scrollIndicators,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import type { ContinueItem } from "@/features/home/utils/continue-items";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ContinueSectionProps } from "./continue-section";
import { useContinueActions } from "./hooks/use-continue-actions";

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

/**
 * Opens the reader at the next chapter; its context menu also opens the
 * manga. Title and progress from the cache.
 */
const ContinueCard = memo(function ContinueCard({
  item,
}: {
  item: ContinueItem;
}) {
  const { read: open, menu } = useContinueActions(
    item.mangaId,
    item.next.id,
    item.next.number,
  );
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
    <ContextMenu items={menu}>
      <HStack
        spacing={10}
        modifiers={[
          padding({ all: 10 }),
          frame({ width: CARD_WIDTH, alignment: "leading" }),
          background(cell),
          clipShape("roundedRectangle", 18),
          onTapGesture(open),
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
          <HStack
            modifiers={[
              frame({ width: 24, height: 24 }),
              background("#0000008c", shapes.circle()),
              // A mark: the card's label already says it continues.
              accessibilityHidden(),
            ]}
          >
            <Icon
              name={Icons.play}
              size={11}
              modifiers={[foregroundStyle("#ffffff")]}
            />
          </HStack>
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
    </ContextMenu>
  );
});
