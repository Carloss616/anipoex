import {
  Box,
  Column,
  HorizontalDivider,
  LazyColumn,
  PullToRefreshBox,
  Row,
  Shape,
  Spacer,
  Surface,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  height,
  offset,
  onVisibilityChanged,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { cn } from "panelui-native/utils/cn";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
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
  loading,
  empty,
  action,
  mediaId,
  entryId,
  maxHeaderHeight,
  refreshing,
  onRefresh,
  className,
}: DetailListProps) {
  const m3 = useThemeM3Colors();
  const setHeaderScrolled = useSetHeaderScrolled();
  const insets = useSafeAreaInsets();
  const last = chapters.length - 1;
  const start = GUTTER + insets.left;
  const end = GUTTER + insets.right;

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
        <LazyColumn
          contentPadding={{ bottom: GUTTER }}
          modifiers={[fillMaxSize()]}
        >
          {/* Compose has no negative padding: the header is stacked over the
              hero and starts below the app bar, covering the art's last stretch. */}
          <Box modifiers={[fillMaxWidth()]}>
            {/* Top sentinel, no scroll events: the header fills once it leaves. */}
            <Box
              modifiers={[
                fillMaxWidth(),
                height(1),
                onVisibilityChanged((atTop) => setHeaderScrolled(!atTop), {
                  minFractionVisible: 0,
                }),
              ]}
            />
            {hero}
            <Column modifiers={[padding(0, maxHeaderHeight, 0, 0)]}>
              {header}
            </Column>
          </Box>
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 8 }}
            modifiers={[padding(start, 0, end, 4)]}
          >
            <Text
              style={{ typography: "titleSmall" }}
              color={m3.primary}
              modifiers={[padding(16, 0, 0, 0)]}
            >
              Chapters
            </Text>
            <Badge>{total}</Badge>
            <Spacer modifiers={[weight(1)]} />
            {action}
          </Row>
          {chapters.length === 0 &&
            (loading ? <LoadingState /> : <EmptyState {...empty} />)}
          <LazyColumn.Items
            data={chapters}
            keyExtractor={(chapter) => String(chapter.id)}
          >
            {({ item, index }) => (
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
                modifiers={[padding(start, 0, end, 0), fillMaxWidth()]}
              >
                <Column>
                  {index > 0 && (
                    <HorizontalDivider modifiers={[padding(16, 0, 16, 0)]} />
                  )}
                  <ChapterItem
                    chapter={item}
                    mediaId={mediaId}
                    entryId={entryId}
                  />
                </Column>
              </Surface>
            )}
          </LazyColumn.Items>
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
