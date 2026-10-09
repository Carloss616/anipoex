import { Spacer } from "@expo/ui";
import {
  Box,
  PullToRefreshBox,
  Shape,
  Surface,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  offset,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { cn } from "panelui-native/utils/cn";
import { EmptyState } from "@/components/empty-state";
import { Column } from "@/components/layout/column";
import { LazyColumn } from "@/components/layout/lazy-column";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Item } from "@/components/ui/item";
import { Typography } from "@/components/ui/typography";
import { useMaxHeaderHeight } from "@/hooks/use-max-header-height";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ChapterItem } from "../chapter-item";
import type { DetailListProps } from "./detail-list";

const RADIUS = 12;

/**
 * The header is transparent, so the hero starts at the top; each chapter is a
 * lazy item, a slice of one card. Tonal elevation only: per-row shadows would seam.
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
  const maxHeaderHeight = useMaxHeaderHeight();
  const m3 = useThemeM3Colors();
  const last = chapters.length - 1;

  return (
    <Host className={cn("flex-1", className)}>
      <PullToRefreshBox
        isRefreshing={refreshing}
        onRefresh={() => void onRefresh()}
        contentAlignment="topCenter"
        // Below the header, not under it.
        indicator={{ modifiers: [offset(0, maxHeaderHeight)] }}
        modifiers={[fillMaxSize()]}
      >
        <LazyColumn modifiers={[fillMaxSize()]} className="gutters pb-gb">
          {/* Compose has no negative padding: the header is stacked over the
              hero and starts below the app bar, covering the art's last stretch. */}
          <Box modifiers={[fillMaxWidth()]}>
            {hero}
            <Column modifiers={[padding(0, maxHeaderHeight, 0, 0)]}>
              {header}
            </Column>
          </Box>
          <Row
            alignment="center"
            className="gutters gap-2 px-safe-offset-gx pb-1"
          >
            <Typography
              type="body-sm"
              weight="medium"
              style={{ color: m3.primary }}
              className="pl-4"
            >
              Chapters
            </Typography>
            <Badge>{total}</Badge>
            <Spacer flexible />
            {action}
          </Row>
          {chapters.length === 0 && (
            <EmptyState title="No chapters available" />
          )}
          <LazyColumn.Items
            data={chapters}
            keyExtractor={(chapter) => String(chapter.id)}
          >
            {({ item, index }) => (
              <Column className="gutters px-safe-offset-gx">
                <Surface
                  tonalElevation={1}
                  shape={Shape.RoundedCorner({
                    cornerRadii: {
                      topStart: index === 0 ? RADIUS : 0,
                      topEnd: index === 0 ? RADIUS : 0,
                      bottomStart: index === last ? RADIUS : 0,
                      bottomEnd: index === last ? RADIUS : 0,
                    },
                  })}
                  modifiers={[fillMaxWidth()]}
                >
                  <Column>
                    {index > 0 && <Item.Separator className="mx-4" />}
                    <ChapterItem chapter={item} entryId={entryId} />
                  </Column>
                </Surface>
              </Column>
            )}
          </LazyColumn.Items>
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
