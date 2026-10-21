import {
  Box,
  Column,
  Image,
  LazyRow,
  Row,
  TextButton,
  VerticalDivider,
} from "@expo/ui/jetpack-compose";
import {
  align,
  background,
  border,
  clickable,
  clip,
  height,
  matchParentSize,
  onVisibilityChanged,
  padding,
  Shapes,
  semantics,
  size,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { RailItem } from "../utils/rail-items";
import { useRail, useSearching } from "./hooks/use-rail";
import type { TitleRailProps } from "./title-rail";

const WIDTH = 80;
const HEIGHT = 114;
const COVER_SHAPE = clip(Shapes.RoundedCorner(8));

/** The menu hands its trigger an `onPress` to open it. */
function Card({ item, onPress }: { item: RailItem; onPress?: () => void }) {
  const m3 = useThemeM3Colors();
  return (
    <Column
      verticalArrangement={{ spacedBy: 6 }}
      modifiers={[
        width(WIDTH),
        ...(onPress ? [clickable(onPress)] : []),
        semantics({
          contentDescription: item.current
            ? `${item.manga.title}, current match`
            : item.manga.title,
        }),
      ]}
    >
      <Box
        modifiers={[
          size(WIDTH, HEIGHT),
          COVER_SHAPE,
          background(m3.surfaceContainerHighest),
          ...(item.current ? [border(2, m3.onSurface)] : []),
        ]}
      >
        {item.manga.thumbnailUrl && (
          <Image
            source={{ uri: item.manga.thumbnailUrl }}
            contentScale="crop"
            contentDescription={null}
            modifiers={[matchParentSize()]}
          />
        )}
      </Box>
      <Text
        style={{ typography: "bodySmall", fontWeight: "500" }}
        maxLines={2}
        overflow="ellipsis"
      >
        {item.manga.title}
      </Text>
    </Column>
  );
}

function Rail({ mangaKey, mangaId, source, actions }: TitleRailProps) {
  const m3 = useThemeM3Colors();
  const { rail, items, menu, loadMore, retry } = useRail(
    mangaKey,
    mangaId,
    source.id,
    actions,
  );
  if (!rail) return null;
  const inset = padding(GUTTER, 0, GUTTER, 12);

  if (rail.status === "loading")
    return (
      <Row horizontalArrangement={{ spacedBy: 10 }} modifiers={[inset]}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            modifiers={[
              size(WIDTH, HEIGHT),
              COVER_SHAPE,
              background(m3.surfaceContainerHighest),
            ]}
          />
        ))}
      </Row>
    );
  if (rail.status === "error" && items.length === 0)
    return (
      <Row verticalAlignment="center" modifiers={[inset]}>
        <Text style={{ typography: "bodyMedium" }} color={m3.error}>
          Couldn't search
        </Text>
        <TextButton onClick={retry}>
          <Text style={{ typography: "labelLarge" }}>Retry</Text>
        </TextButton>
      </Row>
    );
  if (items.length === 0)
    return (
      <Text
        style={{ typography: "bodyMedium" }}
        color={m3.onSurfaceVariant}
        modifiers={[inset]}
      >
        No results
      </Text>
    );

  return (
    <LazyRow
      horizontalArrangement={{ spacedBy: 10 }}
      contentPadding={{ start: GUTTER, end: GUTTER, bottom: 12 }}
    >
      {items.map((item, i) => [
        <Menu key={item.manga.url} items={menu(item)}>
          <Card item={item} />
        </Menu>,
        item.current && i === 0 && items.length > 1 && (
          <VerticalDivider key="divider" modifiers={[height(HEIGHT)]} />
        ),
      ])}
      {(rail.hasNextPage || rail.loadingMore) && (
        // Loads as it scrolls into view; a tap retries a page that failed.
        <Box
          modifiers={[
            size(WIDTH, HEIGHT),
            COVER_SHAPE,
            background(m3.surfaceContainerHighest),
            clickable(loadMore),
            onVisibilityChanged((visible) => visible && loadMore(), {
              minFractionVisible: 0.5,
            }),
            semantics({ contentDescription: "More" }),
          ]}
        >
          <Box modifiers={[align("center")]}>
            {rail.loadingMore ? (
              <Loader size="sm" />
            ) : (
              <Text style={{ typography: "labelLarge" }}>More</Text>
            )}
          </Box>
        </Box>
      )}
    </LazyRow>
  );
}

/** A source's title results under its row, while it searches. */
export const TitleRail = memo(function TitleRail(props: TitleRailProps) {
  return useSearching(props.mangaKey, props.source.id) ? (
    <Rail {...props} />
  ) : null;
});
