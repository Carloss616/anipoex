import {
  Button,
  Divider,
  HStack,
  LazyHStack,
  RoundedRectangle,
  ScrollView,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  background,
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  multilineTextAlignment,
  onAppear,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { memo } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { MangaCard } from "@/features/manga/components/manga-card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSearching } from "../hooks/use-searching";
import type { RailItem } from "../utils/rail-items";
import { CURRENT_MARK } from "./constants";
import { useRail } from "./hooks/use-rail";
import type { TitleRailProps } from "./title-rail";

const WIDTH = 80;
const HEIGHT = 120;
const RADIUS = 6;
const COVER = frame({ width: WIDTH, height: HEIGHT });

/** Tap uses or removes the match, hold opens the menu (`onPrimaryAction`); a context menu would be taken over by the list row. */
function Card({ item, color }: { item: RailItem; color: string }) {
  return (
    // A menu label takes the tint and centres its text: the card keeps its own look.
    <VStack
      modifiers={[foregroundStyle(color), multilineTextAlignment("leading")]}
    >
      <MangaCard
        cover={item.manga.thumbnailUrl}
        title={item.manga.title}
        mark={item.current ? CURRENT_MARK : undefined}
        titlePosition="below"
        accessibilityLabel={
          item.current ? `${item.manga.title}, current match` : item.manga.title
        }
        style={{ width: WIDTH }}
      />
    </VStack>
  );
}

function Rail({ mangaKey, mangaId, source, actions }: TitleRailProps) {
  const [muted, foreground] = useThemeColor(["muted", "foreground"]);
  const { rail, items, notice, menu, tap, loadMore, retry } = useRail(
    mangaKey,
    mangaId,
    source.id,
    actions,
  );
  if (!rail) return null;

  if (rail.status === "loading")
    return (
      <HStack spacing={10} modifiers={[padding({ bottom: 6 })]}>
        {[0, 1, 2, 3].map((i) => (
          <RoundedRectangle
            key={i}
            cornerRadius={RADIUS}
            modifiers={[COVER, foregroundStyle(muted)]}
          />
        ))}
      </HStack>
    );
  // A failed or empty first page, said beside the current card when there is one.
  const line =
    notice === "error" ? (
      <HStack spacing={8}>
        <Text textStyle="subheadline" modifiers={[foregroundStyle("red")]}>
          Couldn't search
        </Text>
        <Button
          label="Retry"
          onPress={retry}
          modifiers={[buttonStyle("borderless")]}
        />
      </HStack>
    ) : notice === "empty" ? (
      <Text textStyle="subheadline" modifiers={[foregroundStyle("secondary")]}>
        No results
      </Text>
    ) : null;
  if (items.length === 0) return line;

  return (
    <VStack alignment="leading" spacing={8}>
      <ScrollView axes="horizontal" showsIndicators={false}>
        <LazyHStack
          spacing={10}
          alignment="top"
          modifiers={[padding({ bottom: 6 })]}
        >
          {items.map((item, i) => [
            <Menu
              key={item.manga.url}
              items={menu(item)}
              // Always set, so tap and hold never swap; during a scan the tap does nothing.
              onPrimaryAction={() => tap(item)?.()}
            >
              <Card item={item} color={foreground} />
            </Menu>,
            item.current && i === 0 && items.length > 1 && (
              <Divider key="divider" modifiers={[frame({ height: HEIGHT })]} />
            ),
          ])}
          {(rail.hasNextPage || rail.loadingMore) && (
            // Loads as it scrolls into view; a tap retries a page that failed.
            <Button
              onPress={loadMore}
              modifiers={[
                buttonStyle("plain"),
                onAppear(loadMore),
                accessibilityLabel("More"),
              ]}
            >
              <ZStack
                modifiers={[
                  COVER,
                  background(muted),
                  clipShape("roundedRectangle", RADIUS),
                ]}
              >
                {rail.loadingMore ? (
                  <Loader size="sm" />
                ) : (
                  <Text textStyle="caption" weight="medium">
                    More
                  </Text>
                )}
              </ZStack>
            </Button>
          )}
        </LazyHStack>
      </ScrollView>
      {line}
    </VStack>
  );
}

/** A source's title results under its row, while it searches. */
export const TitleRail = memo(function TitleRail(props: TitleRailProps) {
  return useSearching(props.mangaKey, props.source.id) ? (
    <Rail {...props} />
  ) : null;
});
