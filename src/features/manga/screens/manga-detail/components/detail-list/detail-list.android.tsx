import {
  Box,
  Column,
  LazyColumn,
  PullToRefreshBox,
  Row,
  Shape,
  Spacer,
  Surface,
} from "@expo/ui/jetpack-compose";
import {
  background,
  fillMaxSize,
  fillMaxWidth,
  height,
  offset,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed, useObservable } from "@legendapp/state/react";
import { cn } from "panelui-native/utils/cn";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { GUTTER } from "@/components/native/constants";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { SEGMENTED_GAP } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ChapterItem } from "../chapter-item";
import { ContinueButton } from "../continue-button";
import { DetailHeader } from "../detail-header";
import { Hero } from "../hero";
import { SourcePicker } from "../source-picker";
import type { DetailListProps } from "./detail-list";

const SHEET = Shape.RoundedCorner({
  cornerRadii: { topStart: 28, topEnd: 28 },
});
const FAB_ROOM = GUTTER + 72;

/**
 * The header is transparent, so the hero starts at the top; each chapter is a
 * lazy item, one segment of a grouped list.
 */
export function DetailList({
  manga,
  chapters,
  total,
  loading,
  empty,
  continue$,
  onContinue,
  maxHeaderHeight,
  refreshing,
  onRefresh,
  className,
}: DetailListProps) {
  const m3 = useThemeM3Colors();
  const setHeaderScrolled = useSetHeaderScrolled();
  // The FAB is expanded at the top.
  const atTop$ = useObservable(true);
  const insets = useSafeAreaInsets();
  const start = GUTTER + insets.left;
  const end = GUTTER + insets.right;
  const sheet = m3.surfaceContainerLowest;

  return (
    <Host className={cn("flex-1", className)}>
      <Box contentAlignment="bottomEnd" modifiers={[fillMaxSize()]}>
        <PullToRefreshBox
          isRefreshing={refreshing}
          onRefresh={() => void onRefresh()}
          contentAlignment="topCenter"
          // Below the header, not under it.
          indicator={{ modifiers: [offset(0, maxHeaderHeight)] }}
          modifiers={[fillMaxSize()]}
        >
          <Box
            modifiers={[
              fillMaxSize(),
              pinnedScrollBehavior((scrolled) => {
                setHeaderScrolled(scrolled);
                atTop$.set(!scrolled);
              }),
            ]}
          >
            <LazyColumn modifiers={[fillMaxSize()]}>
              {/* Compose has no negative padding: the header is stacked over
                the hero and starts below the app bar, covering the art's
                last stretch. */}
              <Box modifiers={[fillMaxWidth()]}>
                <Hero manga={manga} maxHeaderHeight={maxHeaderHeight} />
                <Column modifiers={[padding(0, maxHeaderHeight, 0, 0)]}>
                  <DetailHeader
                    manga={manga}
                    continue$={continue$}
                    onContinue={onContinue}
                  />
                </Column>
              </Box>
              <Surface color={sheet} shape={SHEET} modifiers={[fillMaxWidth()]}>
                <Row
                  verticalAlignment="center"
                  horizontalArrangement={{ spacedBy: 8 }}
                  modifiers={[padding(start, 20, end, 12)]}
                >
                  {/* Not primary: the color is left for the Continue action. */}
                  <Text style={{ typography: "titleLarge" }}>Chapters</Text>
                  <Badge>{total}</Badge>
                  <Spacer modifiers={[weight(1)]} />
                  <SourcePicker manga={manga} />
                </Row>
              </Surface>
              {chapters.length === 0 && (
                <Box modifiers={[fillMaxWidth(), background(sheet)]}>
                  {loading ? <LoadingState /> : <EmptyState {...empty} />}
                </Box>
              )}
              <LazyColumn.Items
                data={chapters}
                keyExtractor={(chapter) => String(chapter.id)}
              >
                {({ item, index }) => (
                  // Padding before the row is its margin, painted as the sheet.
                  <Box
                    modifiers={[
                      background(sheet),
                      padding(start, index === 0 ? 0 : SEGMENTED_GAP, end, 0),
                      fillMaxWidth(),
                    ]}
                  >
                    <ChapterItem
                      chapter={item}
                      mediaId={manga.id}
                      entryId={manga.mediaListEntry?.id}
                      continue$={continue$}
                      index={index}
                      count={chapters.length}
                    />
                  </Box>
                )}
              </LazyColumn.Items>
              {/* Not contentPadding: the sheet runs under the FAB to the
                bottom. */}
              <Box
                modifiers={[
                  fillMaxWidth(),
                  height(FAB_ROOM),
                  background(sheet),
                ]}
              />
            </LazyColumn>
          </Box>
        </PullToRefreshBox>
        <Box modifiers={[padding(0, 0, end, 16)]}>
          <Computed>
            {() => (
              <ContinueButton
                continue$={continue$}
                onPress={onContinue}
                expanded={atTop$.get()}
              />
            )}
          </Computed>
        </Box>
      </Box>
    </Host>
  );
}
