import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
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
  /** The AniList id the rows open the reader with. */
  mediaId: number;
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
 * Web: the chapters as Frame rows, each a slice of one card. No shadow: one
 * per row would draw a seam over the row above.
 */
export function DetailList({
  hero,
  header,
  chapters,
  total,
  loading,
  empty,
  action,
  mediaId,
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
          <Frame className="gutters mx-gx rounded-b-none border-b-0">
            <Frame.Header className="py-0.75">
              <Frame.Title>
                Chapters <Badge>{total}</Badge>
              </Frame.Title>
              <Frame.Action className="row-span-1 flex items-center">
                {action}
              </Frame.Action>
            </Frame.Header>
          </Frame>
        </>
      }
      renderItem={({ item, index }) => (
        <Frame
          className={cn(
            "gutters mx-gx rounded-t-none border-t-0",
            index < last && "rounded-b-none border-b-0",
          )}
        >
          <Frame.Panel
            data-attached="column"
            className={cn(index > 0 && "rounded-t-none!")}
          >
            <ChapterItem chapter={item} mediaId={mediaId} entryId={entryId} />
          </Frame.Panel>
        </Frame>
      )}
      ListEmptyComponent={
        loading ? <LoadingState /> : <EmptyState {...empty} />
      }
      {...headerScroll}
    />
  );
}
