import { memo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { Typography } from "@/components/ui/typography";
import { MangaCard } from "@/features/manga/components/manga-card";
import type { Source } from "@/features/manga/utils/source";
import { useSearching } from "../hooks/use-searching";
import type { SourceActions } from "../hooks/use-source-actions";
import type { RailItem } from "../utils/rail-items";
import { useRail } from "./hooks/use-rail";

export interface TitleRailProps {
  mangaKey: string;
  mangaId: number;
  source: Source;
  actions: SourceActions;
}

const COVER = { width: 80, height: 120 };
// How close to the end, in px, scrolling loads the next page.
const END_GAP = 120;

/** A result as a manga card; the menu hands it `onPress`. */
function Card({ item, onPress }: { item: RailItem; onPress?: () => void }) {
  return (
    <MangaCard
      cover={item.manga.thumbnailUrl}
      title={item.manga.title}
      label={item.current ? "Current match" : undefined}
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
  const { rail, items, menu, loadMore, retry } = useRail(
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
  if (rail.status === "error" && items.length === 0)
    return (
      <View className="flex-row items-center gap-2 px-4 pb-3">
        <Typography type="body-sm" className="flex-1 text-destructive">
          Couldn't search
        </Typography>
        <Button variant="ghost" size="sm" onPress={retry}>
          Retry
        </Button>
      </View>
    );
  if (items.length === 0)
    return (
      <Typography type="body-sm" muted className="px-4 pb-3">
        No results
      </Typography>
    );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={200}
      // The next page loads as the More card comes near.
      onScroll={({
        nativeEvent: { contentOffset, layoutMeasurement, contentSize },
      }) => {
        if (
          contentOffset.x + layoutMeasurement.width >
          contentSize.width - END_GAP
        )
          loadMore();
      }}
      contentContainerClassName="gap-2.5 px-4 pb-3"
    >
      {items.map((item, i) => (
        <View key={item.manga.url} className="flex-row gap-2.5">
          <Menu items={menu(item)}>
            <Card item={item} />
          </Menu>
          {item.current && i === 0 && items.length > 1 && (
            <View className="w-px bg-border" style={{ height: COVER.height }} />
          )}
        </View>
      ))}
      {(rail.hasNextPage || rail.loadingMore) && (
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
      )}
    </ScrollView>
  );
}

/** A source's title results under its row, while it searches. */
export const TitleRail = memo(function TitleRail(props: TitleRailProps) {
  return useSearching(props.mangaKey, props.source.id) ? (
    <Rail {...props} />
  ) : null;
});
