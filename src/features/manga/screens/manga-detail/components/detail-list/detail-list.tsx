import { Spacer } from "@expo/ui";
import { cn } from "panelui-native/utils/cn";
import { RefreshControl, View } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { Column } from "@/components/layout/column";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Item } from "@/components/ui/item";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { useRefreshControlTheme } from "@/hooks/use-theme";
import { type Chapter, ChapterItem } from "../chapter-item";
import { ART_HEIGHT } from "../hero";

export interface DetailListProps {
  /** RN art drawn behind the header; the header overlaps its last `ART_HEIGHT`. */
  hero: React.ReactElement;
  /** Native content above the chapters, laid out in a Host. */
  header: React.ReactElement;
  chapters: Chapter[];
  /** The count in the chapters' section header. */
  total: number;
  /** The section header's trailing control (the source picker). */
  action: React.ReactElement;
  entryId: number | null | undefined;
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
  action,
  entryId,
  refreshing,
  onRefresh,
  className,
}: DetailListProps) {
  const refreshControlTheme = useRefreshControlTheme();
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
          <Host matchContents={{ vertical: true }} className="w-full">
            <Column>
              {header}
              <Row alignment="center" className="gutters gap-2 px-gx pb-1">
                <Typography weight="semibold" className="pl-4">
                  Chapters
                </Typography>
                <Badge>{total}</Badge>
                <Spacer flexible />
                {action}
              </Row>
            </Column>
          </Host>
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
      ListEmptyComponent={<EmptyState title="No chapters available" />}
      {...headerScroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          {...refreshControlTheme}
        />
      }
    />
  );
}
