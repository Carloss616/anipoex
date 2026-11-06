import { useFragment } from "@apollo/client/react";
import { Box, Column, LazyRow, Row } from "@expo/ui/jetpack-compose";
import {
  align,
  background,
  clip,
  combinedClickable,
  matchParentSize,
  padding,
  Shapes,
  semantics,
  size,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import { SectionHeader } from "@/components/native/jetpack-compose/section-header";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import type { ContinueItem } from "@/features/home/utils/continue-items";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ContinueSectionProps } from "./continue-section";
import { useContinueActions } from "./hooks/use-continue-actions";

const CARD_WIDTH = 250;

/** Tonal cards that open the reader at the next chapter. */
export function ContinueSection({ title, items }: ContinueSectionProps) {
  return (
    <Column>
      <SectionHeader title={title} />
      <LazyRow
        horizontalArrangement={{ spacedBy: 8 }}
        contentPadding={{ start: GUTTER, end: GUTTER }}
      >
        <LazyRow.Items
          data={items}
          keyExtractor={(item) => String(item.mangaId)}
          estimatedItemSize={CARD_WIDTH}
        >
          {({ item }) => <ContinueCard item={item} />}
        </LazyRow.Items>
      </LazyRow>
    </Column>
  );
}

const ContinueCard = memo(function ContinueCard({
  item,
}: {
  item: ContinueItem;
}) {
  const { read, menu } = useContinueActions(
    item.mangaId,
    item.next.id,
    item.next.number,
  );
  // A long press opens the menu: continue, or the manga's page.
  return (
    <ContextMenu items={menu}>
      <Card item={item} onPress={read} />
    </ContextMenu>
  );
});

/** The tonal card; `ContextMenu` hands it the long press. */
function Card({
  item,
  onPress,
  onLongPress,
}: {
  item: ContinueItem;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const m3 = useThemeM3Colors();
  // Title and cover come from the cache, which the Continue query filled.
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: item.mangaId },
  });
  const read = data.mediaListEntry?.progress ?? 0;
  const name = data.title?.userPreferred ?? "";
  const cover = data.coverImage?.medium;
  const caption = `Chapter ${item.next.number} · ${item.unread} new`;

  return (
    <Row
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 12 }}
      modifiers={[
        width(CARD_WIDTH),
        clip(Shapes.RoundedCorner(24)),
        background(m3.surfaceContainer),
        combinedClickable({ onClick: onPress, onLongClick: onLongPress }),
        semantics({ contentDescription: `Continue ${name}, ${caption}` }),
        padding(12, 12, 12, 12),
      ]}
    >
      <Box
        modifiers={[
          size(52, 76),
          clip(Shapes.RoundedCorner(14)),
          background(data.coverImage?.color ?? m3.surfaceContainerHighest),
        ]}
      >
        {cover && (
          <Image source={{ uri: cover }} modifiers={[matchParentSize()]} />
        )}
        {/* M3 Expressive: a shaped container marks the one action, resume. */}
        <Box
          contentAlignment="center"
          modifiers={[
            align("center"),
            size(30, 30),
            clip(Shapes.Material.Cookie9Sided),
            background(m3.primaryContainer),
          ]}
        >
          <Icon name={Icons.play} size={18} color={m3.onPrimaryContainer} />
        </Box>
      </Box>
      <Column verticalArrangement={{ spacedBy: 2 }} modifiers={[weight(1)]}>
        <Text
          style={{ typography: "titleSmall" }}
          maxLines={1}
          overflow="ellipsis"
        >
          {name}
        </Text>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          <Text style={{ typography: "bodySmall" }} color={m3.onSurfaceVariant}>
            Read
          </Text>
          <Badge>{`c.${read}`}</Badge>
          <Badge color="primary">{`+${item.unread}`}</Badge>
        </Row>
        <Box modifiers={[padding(0, 8, 0, 0)]}>
          <Progress value={(read / (read + item.unread)) * 100} size="sm" />
        </Box>
      </Column>
    </Row>
  );
}
