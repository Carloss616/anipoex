import { LegendList } from "@legendapp/list/react";
import { memo } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { Typography } from "@/components/ui/typography";
import { MangaCard } from "@/features/manga/components/manga-card";
import type { Source } from "@/features/manga/utils/source";
import { useSearching } from "../hooks/use-searching";
import type { SourceActions } from "../hooks/use-source-actions";
import type { RailItem } from "../utils/rail-items";
import { CURRENT_MARK } from "./constants";
import { useRail } from "./hooks/use-rail";

export interface TitleRailProps {
  mangaKey: string;
  mangaId: number;
  source: Source;
  actions: SourceActions;
}

const COVER = { width: 80, height: 120 };
const GAP = 10;
// One card and the gap after it, so the list lays out before measuring.
const CARD_SPAN = COVER.width + GAP;
// The cover, two title lines and the label badge.
const RAIL_HEIGHT = COVER.height + 72;

/** A tap opens the card's menu, which holds every action: the menu hands the card its press. */
function Card({ item, onPress }: { item: RailItem; onPress?: () => void }) {
  return (
    <MangaCard
      cover={item.manga.thumbnailUrl}
      title={item.manga.title}
      mark={item.current ? CURRENT_MARK : undefined}
      titlePosition="below"
      accessibilityLabel={
        item.current ? `${item.manga.title}, current match` : item.manga.title
      }
      style={{ width: COVER.width }}
      onPress={onPress}
    />
  );
}

function Rail({ mangaKey, mangaId, source, actions }: TitleRailProps) {
  const { rail, items, notice, menu, loadMore, retry } = useRail(
    mangaKey,
    mangaId,
    source.id,
    actions,
  );
  if (!rail) return null;

  if (rail.status === "loading")
    return (
      <View className="flex-row gap-2.5 px-4 pb-3">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="rounded-md bg-muted" style={COVER} />
        ))}
      </View>
    );

  return (
    <View className="gap-2 pb-3">
      {items.length > 0 && (
        // A horizontal list in the sheet's vertical one, as in LegendList's media rails.
        <LegendList
          horizontal
          data={items}
          keyExtractor={(item) => item.manga.url}
          estimatedItemSize={CARD_SPAN}
          recycleItems
          onEndReached={loadMore}
          // The list spaces and insets its cards itself (it reads only these
          // keys): a card's own padding can be measured late, so cards touch.
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 16,
            gap: GAP,
          }}
          style={{ minWidth: 0, minHeight: RAIL_HEIGHT }}
          renderItem={({ item, index }) => (
            <View className="flex-row gap-2.5">
              <Menu items={menu(item)}>
                <Card item={item} />
              </Menu>
              {item.current && index === 0 && items.length > 1 && (
                <View
                  className="w-px bg-border"
                  style={{ height: COVER.height }}
                />
              )}
            </View>
          )}
          ListFooterComponent={
            rail.hasNextPage || rail.loadingMore ? (
              <Pressable
                onPress={loadMore}
                accessibilityRole="button"
                accessibilityLabel="More"
                className="items-center justify-center rounded-md bg-muted"
                style={COVER}
              >
                {rail.loadingMore ? (
                  <Loader size="sm" />
                ) : (
                  <Typography type="body-xs" weight="medium">
                    More
                  </Typography>
                )}
              </Pressable>
            ) : undefined
          }
        />
      )}
      {notice === "error" ? (
        <View className="flex-row items-center gap-2 px-4">
          <Typography type="body-sm" className="flex-1 text-destructive">
            Couldn't search
          </Typography>
          <Button variant="ghost" size="sm" onPress={retry}>
            Retry
          </Button>
        </View>
      ) : notice === "empty" ? (
        <Typography type="body-sm" muted className="px-4">
          No results
        </Typography>
      ) : null}
    </View>
  );
}

/** A source's title results under its row, while it searches. */
export const TitleRail = memo(function TitleRail(props: TitleRailProps) {
  return useSearching(props.mangaKey, props.source.id) ? (
    <Rail {...props} />
  ) : null;
});
