import { cn } from "panelui-native/utils/cn";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/components/ui/item";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { ChapterItem } from "../chapter-item";
import { ART_HEIGHT } from "../hero";

export interface DetailListProps {
  /** RN art drawn behind the header; the header overlaps its last `ART_HEIGHT`. */
  hero: React.ReactElement;
  /** Content above the chapters. */
  header: React.ReactElement;
  chapters: Chapter[];
  /** The count in the chapters' section header. */
  total: number;
  /** The section header's trailing control (the source picker). */
  action: React.ReactElement;
  entryId: number | null | undefined;
  /** The header at rest, from the screen's `useMaxHeaderHeight`; native only. */
  maxHeaderHeight: number;
  /** Shown instead of `empty` while the chapters are loading and none are listed. */
  loading?: boolean;
  /** What an empty list says. */
  empty: { title: string; description?: string };
  /** Pull to refresh, iOS and Android only. */
  refreshing: boolean;
  onRefresh: () => Promise<unknown> | undefined;
  className?: string;
}

/**
 * Web: the chapters as list items, each row a slice of one card. Not
 * `elevated`: a shadow per row would draw a seam over the row above.
 */
export function DetailList({
  hero,
  header,
  chapters,
  total,
  loading,
  empty,
  action,
  entryId,
  className,
}: DetailListProps) {
  const headerScroll = useHeaderScroll();
  const last = chapters.length - 1;

  return (
    <LegendList
      data={chapters}
      keyExtractor={(chapter) => String(chapter.id)}
      // Rows only redraw when this changes: a first save gives the entry an id,
      // and the last row's rounding follows the count.
      extraData={`${entryId}:${last}`}
      className={className}
      contentContainerClassName="gutters pb-gb"
      ListHeaderComponent={
        <>
          <View style={{ marginBottom: -ART_HEIGHT }}>{hero}</View>
          {header}
          <View className="gutters flex-row items-center gap-2 px-gx pb-1">
            <Typography weight="semibold" className="pl-4">
              Chapters
            </Typography>
            <Badge>{total}</Badge>
            <View className="flex-1" />
            {action}
          </View>
        </>
      }
      renderItem={({ item, index }) => (
        <View className="gutters px-gx">
          <Surface
            padding="none"
            className={cn(
              "w-full",
              index > 0 && "rounded-t-none",
              index < last && "rounded-b-none",
            )}
          >
            {index > 0 && <Item.Separator className="mx-4" />}
            <ChapterItem chapter={item} entryId={entryId} />
          </Surface>
        </View>
      )}
      ListEmptyComponent={
        loading ? <LoadingState /> : <EmptyState {...empty} />
      }
      {...headerScroll}
    />
  );
}
