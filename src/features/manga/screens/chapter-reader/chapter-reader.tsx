import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import {
  isRuntimeAvailable,
  RUNTIME_UNAVAILABLE,
  type SourcePage,
  useInstalledSources,
} from "@/features/extensions";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useSourceChapters } from "@/features/manga/hooks/use-source-chapters";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { nextChapter } from "@/features/manga/utils/next-chapter";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { ChapterEnd } from "./components/chapter-end";
import { PageImage } from "./components/page-image";
import { ReaderBar } from "./components/reader-bar";
import { useChapterPages } from "./hooks/use-chapter-pages";
import { useReadingProgress } from "./hooks/use-reading-progress";

// Desktop windows are far wider than a page is meant to be read.
const COLUMN = { width: "100%", maxWidth: 800, marginInline: "auto" } as const;

const chapterName = (chapter: Chapter | undefined) =>
  !chapter
    ? ""
    : chapter.number >= 0
      ? `Chapter ${chapter.number}`
      : chapter.title;

/** A chapter as one continuous vertical scroll of its pages, the end block under the last. */
export function ChapterReader() {
  const {
    mediaId,
    chapter: chapterUrl,
    title,
  } = useLocalSearchParams<{
    mediaId: string;
    chapter: string;
    /** The row's title, until the chapter list loads (or if it no longer has this chapter). */
    title?: string;
  }>();
  const router = useRouter();
  const { manga, loading: mangaLoading } = useMangaEntry(mediaId);
  const sources = useInstalledSources();
  const { match, matching } = useSourceMatch(Number(mediaId));
  // Fetched again here rather than handed over: the detail keeps its list in local state.
  const { chapters } = useSourceChapters(match);
  const { pages, loading, error, reload } = useChapterPages(
    match?.sourceId,
    chapterUrl,
  );
  const [visible, setVisible] = useState(true);
  const [page, setPage] = useState(1);
  const progress = useReadingProgress(
    manga ?? { id: Number(mediaId) },
    chapterUrl,
  );

  const current = chapters.find((chapter) => chapter.id === chapterUrl);
  const next = current && nextChapter(chapters, current);
  const name = chapterName(current) || (title ?? "");
  const sourceName = sources.find(
    (source) => source.id === match?.sourceId,
  )?.name;
  const subtitle = [manga?.title?.userPreferred, sourceName]
    .filter(Boolean)
    .join(" · ");

  const back = () =>
    router.canGoBack() ? router.back() : router.replace(`/manga/${mediaId}`);
  const toggle = useCallback(() => setVisible((shown) => !shown), []);
  const renderItem = useCallback(
    ({ item }: { item: SourcePage }) => (
      <PageImage page={item} onPress={toggle} onRetry={reload} />
    ),
    [toggle, reload],
  );
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number }[] }) => {
      const first = Math.min(...viewableItems.map((token) => token.index));
      if (Number.isFinite(first)) setPage(first + 1);
    },
    [],
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
        action={{ label: "Retry", onPress: reload }}
      />
    ) : (
      <LegendList
        // A new chapter starts from its first page.
        key={chapterUrl}
        data={pages}
        keyExtractor={(item) => String(item.index)}
        contentContainerStyle={COLUMN}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
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
                  setPage(1);
                  router.setParams({ chapter: next.id, title: next.title });
                },
              }
            }
            onBack={back}
          />
        }
      />
    );

  return (
    <View className="flex-1 bg-background">
      {body}
      <ReaderBar
        chapter={name}
        subtitle={subtitle}
        visible={visible}
        page={page}
        count={pages.length}
        onBack={back}
      />
    </View>
  );
}
