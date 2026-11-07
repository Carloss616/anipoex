import type { Observable } from "@legendapp/state";
import { usePathname } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { useId } from "react";
import { ScrollView, View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { sourceListMangaId } from "@/features/manga/utils/source-list-href";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import type { Continue$ } from "../../hooks/use-continue";
import { ChapterItem } from "../chapter-item";
import { ContinueButton } from "../continue-button";
import { DetailHeader } from "../detail-header";
import { DetailSidebar } from "../detail-sidebar";
import { ART_HEIGHT, Hero } from "../hero";
import { SourcePicker } from "../source-picker";
import { useScrollSync } from "./hooks/use-scroll-sync";

export interface DetailListProps {
  manga: MangaDetail;
  chapters: Chapter[];
  /** The count in the chapters' section header. */
  total: number;
  continue$: Continue$;
  /** Opens `continue$`'s action. */
  onContinue: () => void;
  /** The header at rest, from the screen's `useMaxHeaderHeight`. */
  maxHeaderHeight: number;
  /** Shown instead of `empty` while chapters load and none are listed. */
  loading?: boolean;
  /** What an empty list says. */
  empty: { title: string; description?: string };
  /** Pull to refresh, iOS and Android only. */
  refreshing: boolean;
  onRefresh: () => Promise<unknown> | undefined;
  /**
   * Set while the title is scrolled away, for the header to show it.
   * @platform web
   */
  titleOut$: Observable<boolean>;
  className?: string;
}

/** The section header's row in the list, so it can stick. */
const HEADER = "header";
type Row = Chapter | typeof HEADER;
const STICKY = [0];

/**
 * Web: the chapters as Frame rows, each a slice of one card. No shadow: one
 * per row would draw a seam over the row above.
 */
export function DetailList({
  manga,
  chapters,
  total,
  loading,
  empty,
  continue$,
  onContinue,
  titleOut$,
  maxHeaderHeight,
  className,
}: DetailListProps) {
  const headerScroll = useHeaderScroll();
  const headerHeight = useHeaderHeight();
  const wide = useBreakpoint().isAtLeast("lg");
  const entryId = manga.mediaListEntry?.id;
  // The source list draws over the detail, which stays in sight under it.
  const covered = sourceListMangaId(usePathname()) === manga.id;
  const last = chapters.length;
  const hero = <Hero manga={manga} maxHeaderHeight={maxHeaderHeight} />;
  const action = <SourcePicker manga={manga} />;
  const rows: Row[] = last > 0 ? [HEADER, ...chapters] : [];

  // Relative: an absolute offset from the shorter sidebar threw the chapters
  // back near the top. Own key: a detail pushed over this one scrolls alone.
  const syncKey = useId();
  const sidebarSync = useScrollSync({ syncKey, syncType: "relative" });
  const listSync = useScrollSync({ syncKey, syncType: "relative" });

  return (
    <View className={cn("flex-1", className)}>
      {wide && (
        <View pointerEvents="none" className="absolute inset-x-0 top-0">
          {hero}
        </View>
      )}
      <View className="flex-1 flex-row">
        {wide && (
          <ScrollView
            ref={sidebarSync.ref}
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            {...headerScroll}
            onScroll={(event) => {
              headerScroll.onScroll?.(event);
              sidebarSync.onScroll?.(event);
            }}
            onScrollBeginDrag={() => {
              sidebarSync.setActive();
            }}
          >
            <HeaderInsetView className="gutters pb-gb pl-gx box-content w-66 pr-4">
              <DetailSidebar
                manga={manga}
                continue$={continue$}
                onContinue={onContinue}
              />
            </HeaderInsetView>
          </ScrollView>
        )}
        <View className="flex-1">
          <LegendList
            visibleWhenBlurred={covered}
            refScrollView={listSync.ref}
            {...headerScroll}
            onScroll={(event) => {
              headerScroll.onScroll?.(event);
              listSync.onScroll?.(event);
            }}
            onScrollBeginDrag={() => {
              listSync.setActive();
            }}
            data={rows}
            keyExtractor={(row) => (row === HEADER ? HEADER : row.id)}
            getItemType={(row) => (row === HEADER ? HEADER : "chapter")}
            // Rows only redraw when this changes: a first save gives the
            // entry an id, and the last row's rounding follows the count.
            extraData={`${entryId}:${last}`}
            itemLayoutAnimation={LinearTransition}
            stickyHeaderIndices={STICKY}
            stickyHeaderConfig={{ offset: headerHeight }}
            contentContainerClassName="gutters pb-gb"
            ListHeaderComponent={
              <>
                {wide ? (
                  <HeaderInsetView />
                ) : (
                  <View style={{ marginBottom: -ART_HEIGHT }}>{hero}</View>
                )}
                <DetailHeader
                  manga={manga}
                  continue$={continue$}
                  onContinue={onContinue}
                  titleOut$={titleOut$}
                />
              </>
            }
            renderItem={({ item, index }) =>
              item === HEADER ? (
                <ChaptersHeader total={total} action={action} attached />
              ) : (
                <Frame
                  className={cn(
                    "gutters mx-gx rounded-t-none border-t-0 lg:ml-4",
                    index < last && "rounded-b-none border-b-0",
                  )}
                >
                  <Frame.Panel
                    data-attached="column"
                    className={cn(index > 1 && "rounded-t-none!")}
                  >
                    <ChapterItem
                      chapter={item}
                      mediaId={manga.id}
                      entryId={entryId}
                      continue$={continue$}
                    />
                  </Frame.Panel>
                </Frame>
              )
            }
            ListEmptyComponent={
              <>
                <ChaptersHeader total={total} action={action} />
                {loading ? <LoadingState /> : <EmptyState {...empty} />}
              </>
            }
            // Room for the floating Continue over the last row.
            ListFooterComponent={<View className="h-16 lg:hidden" />}
          />
          {!wide && (
            // Above the floating tab bar; desktop shows it in the side column.
            <View
              pointerEvents="box-none"
              className="gutters px-gx pb-gb absolute inset-x-0 bottom-0 items-center"
            >
              <ContinueButton
                continue$={continue$}
                onPress={onContinue}
                className="shadow-lg"
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/** `attached` joins it to the rows below. */
function ChaptersHeader({
  total,
  action,
  attached,
}: {
  total: number;
  action: React.ReactElement;
  attached?: boolean;
}) {
  return (
    <Frame
      className={cn(
        "gutters mx-gx lg:ml-4",
        attached && "rounded-b-none border-b-0",
        "stuck:glass-chrome! stuck:glass-muted stuck:rounded-full stuck:border stuck:shadow-lg",
      )}
    >
      <Frame.Header>
        <Frame.Title>
          Chapters <Badge>{total}</Badge>
        </Frame.Title>
        <Frame.Action className="flex items-center">{action}</Frame.Action>
      </Frame.Header>
    </Frame>
  );
}
