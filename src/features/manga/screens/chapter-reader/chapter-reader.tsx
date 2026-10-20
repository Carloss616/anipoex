import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { LegendList } from "@/components/layout/legend-list";
import { isRuntimeAvailable, useInstalledSources } from "@/features/extensions";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useSourceChapters } from "@/features/manga/hooks/use-source-chapters";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { nextChapter } from "@/features/manga/utils/next-chapter";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { noop } from "@/utils/utils";
import { ChapterEnd, type ChapterEndProps } from "./components/chapter-end";
import { PageImage } from "./components/page-image";
import { ReaderBar } from "./components/reader-bar";
import { useChapterPages } from "./hooks/use-chapter-pages";

const NO_SAVE: ChapterEndProps["save"] = { state: "none", changes: [] };

const chapterName = (chapter: Chapter | undefined) =>
  !chapter
    ? ""
    : chapter.number >= 0
      ? `Chapter ${chapter.number}`
      : chapter.title;

/** A chapter as one continuous vertical scroll of its pages, the end block under the last. */
export function ChapterReader() {
  const { mediaId, chapter: chapterUrl } = useLocalSearchParams<{
    mediaId: string;
    chapter: string;
  }>();
  const router = useRouter();
  const { manga } = useMangaEntry(mediaId);
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

  const current = chapters.find((chapter) => chapter.id === chapterUrl);
  const next = current && nextChapter(chapters, current);
  const name = chapterName(current);
  const sourceName = sources.find(
    (source) => source.id === match?.sourceId,
  )?.name;
  const subtitle = [manga?.title?.userPreferred, sourceName]
    .filter(Boolean)
    .join(" · ");

  const back = () =>
    router.canGoBack() ? router.back() : router.replace(`/manga/${mediaId}`);
  const toggle = () => setVisible((shown) => !shown);

  const body =
    !match && !matching ? (
      <EmptyState
        title="Couldn't load this chapter"
        description={
          isRuntimeAvailable
            ? "Pick a source for this manga first."
            : "Extensions run in the Android, iOS and desktop apps."
        }
      />
    ) : pages.length === 0 && (loading || matching) ? (
      <LoadingState />
    ) : error ? (
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
        renderItem={({ item }) => (
          <PageImage page={item} onPress={toggle} onRetry={reload} />
        )}
        onViewableItemsChanged={({ viewableItems }) => {
          const first = Math.min(...viewableItems.map((token) => token.index));
          if (Number.isFinite(first)) setPage(first + 1);
        }}
        ListFooterComponent={
          <ChapterEnd
            chapter={name}
            save={NO_SAVE}
            onUndo={noop}
            onAdd={noop}
            onNotNow={noop}
            next={
              next && {
                label:
                  next.number >= 0
                    ? `Load chapter ${next.number}`
                    : "Load next chapter",
                onPress: () => {
                  setPage(1);
                  router.setParams({ chapter: next.id });
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
