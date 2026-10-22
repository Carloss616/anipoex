import {
  Box,
  Column,
  LazyRow,
  Row,
  TextButton,
  VerticalDivider,
} from "@expo/ui/jetpack-compose";
import {
  align,
  background,
  clickable,
  clip,
  height,
  onVisibilityChanged,
  padding,
  Shapes,
  semantics,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { Skeleton } from "panelui-native/components/skeleton";
import { View } from "react-native";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { RNHostView } from "@/components/ui/host";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { COVER_RADIUS } from "@/features/manga/components/manga-card";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { COVER } from "../constants";
import type { RailProps } from "../rail";
import { RailCard } from "../rail-card";
import { useRail } from "./hooks/use-rail";

const COVER_SHAPE = clip(Shapes.RoundedCorner(COVER_RADIUS));

/**
 * Pulsing covers while the first page loads: the web Skeleton, hosted, since
 * @expo/ui's Compose animations jump to their target in this list.
 */
function Placeholders() {
  const m3 = useThemeM3Colors();
  const block = {
    ...COVER,
    borderRadius: COVER_RADIUS,
    backgroundColor: m3.surfaceContainerHighest,
  };
  return (
    <RNHostView matchContents modifiers={[padding(GUTTER, 0, GUTTER, 12)]}>
      <View className="flex-row gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} style={block} />
        ))}
      </View>
    </RNHostView>
  );
}

/** The rail itself: a skeleton while the first page loads, then the cards and a More card. */
export function RailContent({ mangaKey, mangaId, source, actions }: RailProps) {
  const m3 = useThemeM3Colors();
  const { rail, items, notice, menu, loadMore, retry } = useRail(
    mangaKey,
    mangaId,
    source.id,
    actions,
  );
  if (!rail) return null;
  const inset = padding(GUTTER, 0, GUTTER, 12);

  if (rail.status === "loading") return <Placeholders />;
  // A failed or empty first page, said beside the current card when there is one.
  const line =
    notice === "error" ? (
      <Row verticalAlignment="center" modifiers={[inset]}>
        <Text style={{ typography: "bodyMedium" }} color={m3.error}>
          Couldn't search
        </Text>
        <TextButton onClick={retry}>
          <Text style={{ typography: "labelLarge" }}>Retry</Text>
        </TextButton>
      </Row>
    ) : notice === "empty" ? (
      <Text
        style={{ typography: "bodyMedium" }}
        color={m3.onSurfaceVariant}
        modifiers={[inset]}
      >
        No results
      </Text>
    ) : null;
  if (items.length === 0) return line;

  return (
    <Column>
      <LazyRow
        horizontalArrangement={{ spacedBy: 10 }}
        contentPadding={{ start: GUTTER, end: GUTTER, bottom: 12 }}
      >
        {items.map((item, i) => [
          <Menu key={item.manga.url} items={menu(item)}>
            <RailCard item={item} headers={source.headers} />
          </Menu>,
          item.current && i === 0 && items.length > 1 && (
            <VerticalDivider key="divider" modifiers={[height(COVER.height)]} />
          ),
        ])}
        {(rail.hasNextPage || rail.loadingMore) && (
          // Loads as it scrolls into view; a tap retries a page that failed.
          <Box
            modifiers={[
              size(COVER.width, COVER.height),
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
      {line}
    </Column>
  );
}
