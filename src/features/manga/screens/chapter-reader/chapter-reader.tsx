import type { LegendListRef } from "@legendapp/list/react-native";
import { Computed, useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import { Typography } from "@/components/ui/typography";
import {
  isRuntimeAvailable,
  RUNTIME_UNAVAILABLE,
  type SourcePage,
} from "@/features/extensions";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useSourceChapters } from "@/features/manga/hooks/use-source-chapters";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { nextChapter } from "@/features/manga/utils/next-chapter";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { useThemeM3Colors } from "@/hooks/use-theme";
import { ChapterEnd } from "./components/chapter-end";
import { PageCount } from "./components/page-count";
import { PageImage } from "./components/page-image";
import { ZoomView } from "./components/zoom-view";
import { useChapterPages } from "./hooks/use-chapter-pages";
import { useReadingProgress } from "./hooks/use-reading-progress";

// Desktop windows are far wider than a page is meant to be read.
const COLUMN = { width: "100%", maxWidth: 800, marginInline: "auto" } as const;
/** How far one scroll down runs before the header hides: about its own height. */
const HIDE_AFTER = 80;

const chapterName = (chapter: Chapter | undefined) =>
  !chapter
    ? ""
    : chapter.number >= 0
      ? `Chapter ${chapter.number}`
      : chapter.title;

/** A chapter as one continuous vertical scroll of its pages, the end block under the last. */
export function ChapterReader() {
  const { id: mediaId, chapter: chapterUrl } = useLocalSearchParams<{
    id: string;
    /** The chapter's url in its source. */
    chapter: string;
  }>();
  const router = useRouter();
  const { manga, loading: mangaLoading } = useMangaEntry(mediaId);
  const { match, matching } = useSourceMatch(Number(mediaId));
  // The list the detail stored; fetched only when there is none.
  const { chapters, loading: chaptersLoading } = useSourceChapters(
    Number(mediaId),
    match,
  );
  const current = chapters.find((chapter) => chapter.id === chapterUrl);
  // The pages wait for the list: some sources need the chapter's memo to find them.
  const { pages, loading, error, reload } = useChapterPages(
    chaptersLoading ? undefined : match?.sourceId,
    chapterUrl,
    current?.memo ?? undefined,
  );
  const visible$ = useObservable(true);
  const listRef = useRef<LegendListRef>(null);
  const lastScroll = useRef(0);
  // Where the current run down started: the last turn up, or where a tap showed the header.
  const runStart = useRef(0);
  const m3 = useThemeM3Colors();
  // Android only: iOS keeps the blur, which a color would cover.
  const headerStyle = { backgroundColor: m3?.surfaceContainer };
  const page$ = useObservable(1);
  const progress = useReadingProgress(
    manga ?? { id: Number(mediaId) },
    chapterUrl,
  );

  const next = current && nextChapter(chapters, current);
  const name = chapterName(current);

  const back = () =>
    router.canGoBack() ? router.back() : router.replace(`/manga/${mediaId}`);
  const toggle = useCallback(() => {
    runStart.current = lastScroll.current;
    visible$.set((shown) => !shown);
  }, [visible$]);
  // Reading on hides the header; back at the top it shows again.
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      if (y <= 0) visible$.set(true);
      else if (y < lastScroll.current) runStart.current = y;
      else if (y - runStart.current > HIDE_AFTER) visible$.set(false);
      lastScroll.current = y;
    },
    [visible$],
  );
  const sourceId = match?.sourceId;
  // Pages only come with a source, so the null is never drawn.
  const renderItem = useCallback(
    ({ item }: { item: SourcePage }) =>
      sourceId ? (
        <PageImage
          sourceId={sourceId}
          page={item}
          onPress={toggle}
          onRetry={reload}
        />
      ) : null,
    [sourceId, toggle, reload],
  );
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number }[] }) => {
      const first = Math.min(...viewableItems.map((token) => token.index));
      if (Number.isFinite(first)) page$.set(first + 1);
    },
    [page$.set],
  );
  // Only the current chapter's own pages, with the manga's entry loaded, count as reading it.
  // shortcut: an end reached before the chapter list or manga loads is not retried until the user scrolls back to it; retry on load if that shows up.
  const onEndReached = () => {
    if (current && manga && !mangaLoading && pages.length > 0)
      progress.reached(current);
  };

  const body =
    !match && !matching ? (
      <EmptyState
        title="Couldn't load this chapter"
        description={
          isRuntimeAvailable
            ? "Pick a source for this manga first."
            : RUNTIME_UNAVAILABLE
        }
      />
    ) : pages.length === 0 && (loading || matching) ? (
      <LoadingState />
    ) : error && pages.length === 0 ? (
      <EmptyState
        title="Couldn't load this chapter"
        description={error}
        actions={[{ label: "Retry", onPress: reload }]}
      />
    ) : (
      // A new chapter starts from its first page, at 1x.
      <ZoomView key={chapterUrl} listRef={listRef}>
        {({ refScrollView, renderScrollComponent, bottomSpace }) => (
          <LegendList
            ref={listRef}
            refScrollView={refScrollView}
            renderScrollComponent={renderScrollComponent}
            data={pages}
            keyExtractor={(item) => String(item.index)}
            // Each page keeps its own measured ratio and failed state; a recycled row would show another page's.
            recycleItems={false}
            contentContainerStyle={COLUMN}
            ListFooterComponentStyle={{ paddingBottom: bottomSpace }}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onEndReached={onEndReached}
            // Fires once the end block is on screen, not half a screen early.
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              <ChapterEnd
                chapter={name}
                save={progress.save}
                onUndo={progress.undo}
                onAdd={progress.add}
                onNotNow={progress.notNow}
                next={
                  next && {
                    label:
                      next.number >= 0
                        ? `Load chapter ${next.number}`
                        : "Load next chapter",
                    onPress: () => {
                      page$.set(1);
                      router.setParams({ chapter: next.id });
                    },
                  }
                }
                onBack={back}
              />
            }
          />
        )}
      </ZoomView>
    );

  return (
    <>
      <Computed>
        {() => (
          <Stack.Header
            hidden={!visible$.get()}
            blurEffect="systemChromeMaterial"
            style={headerStyle}
          />
        )}
      </Computed>
      <Stack.Screen options={{ title: name }} />
      <Stack.Title asChild>
        <View className="min-w-0 flex-1">
          <Typography
            type="body-sm"
            weight="semibold"
            numberOfLines={1}
            style={{ color: m3?.onSurface }}
          >
            {manga?.title?.userPreferred}
          </Typography>
          <Typography
            type="body-xs"
            muted
            numberOfLines={1}
            style={{ color: m3?.onSurfaceVariant }}
          >
            {name}
          </Typography>
        </View>
      </Stack.Title>
      <View className="flex-1 bg-background">
        {body}
        <Computed>
          {() =>
            visible$.get() && <PageCount page$={page$} count={pages.length} />
          }
        </Computed>
      </View>
    </>
  );
}
