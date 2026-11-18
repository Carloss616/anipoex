import { Computed, useObservable, useValue } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { Host } from "@/components/ui/host";
import { refreshDownloaded } from "@/features/downloads";
import {
  installedLoaded$,
  isRuntimeAvailable,
  RUNTIME_UNAVAILABLE,
  refreshInstalled,
  useAllInstalledSources,
} from "@/features/extensions";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useSourceChapters } from "@/features/manga/hooks/use-source-chapters";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { useSourceSearch } from "@/features/manga/hooks/use-source-search";
import { startTitleSearch } from "@/features/manga/state/title-search";
import { sourceListHref } from "@/features/manga/utils/source-list-href";
import { searchTitles } from "@/features/manga/utils/source-match";
import { useMaxHeaderHeight } from "@/hooks/use-max-header-height";
import { noop } from "@/utils/utils";
import { ContinueSync } from "./components/continue-sync";
import { DetailList } from "./components/detail-list";
import { DetailToolbar } from "./components/detail-toolbar";
import type { ContinueAction } from "./hooks/use-continue";

export function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const maxHeaderHeight = useMaxHeaderHeight();
  const { manga, loading, refreshing, refresh } = useMangaEntry(id);
  const sources = useAllInstalledSources();
  const { match, matching } = useSourceMatch(Number(id));
  // Web: the header shows the title once it scrolls away.
  const titleOut$ = useObservable(false);
  // Read by the rows and buttons, not by this screen.
  const continue$ = useObservable<ContinueAction | null>(null);
  const router = useRouter();
  // Destructured so `refreshAll` only changes with the match: each new toolbar
  // re-renders the whole stack.
  const {
    chapters,
    loading: chaptersLoading,
    error,
    refresh: refreshChapters,
  } = useSourceChapters(Number(id), match);

  const { resume, pick } = useSourceSearch(manga);
  const [resumed, setResumed] = useState(false);
  const [picked, setPicked] = useState(false);
  const loaded = useValue(installedLoaded$);
  const pendingId = match?.manga === undefined ? match?.sourceId : undefined;

  // A pick without a manga is searched once each time the detail opens;
  // Refresh retries it after that.
  useEffect(() => {
    if (!pendingId || !manga || resumed) return;
    setResumed(true);
    resume(pendingId);
  }, [pendingId, manga, resume, resumed]);

  // With no pick at all, the best source by its probes is picked once when
  // the detail opens, as a scan would; its chapters then load.
  useEffect(() => {
    if (picked || !manga || !loaded) return;
    setPicked(true);
    pick();
  }, [picked, manga, loaded, pick]);

  // A new pick hides the previous source's rows so the loading state shows.
  const rows = matching ? [] : chapters;
  const openContinue = () => {
    const action = continue$.peek();
    if (action?.chapter)
      router.push({
        pathname: "/manga/[id]/reader",
        params: { id, chapter: action.chapter.id },
      });
    else if (action) router.push(sourceListHref(id));
  };

  const refreshAll = () =>
    Promise.all([
      refresh(),
      refreshChapters(),
      refreshInstalled(),
      pendingId && resume(pendingId),
      // Picks up folders and files changed by hand.
      match && refreshDownloaded(Number(id), match.sourceId).catch(noop),
    ]);
  const sourceName =
    sources.find((entry) => entry.id === match?.sourceId)?.name ??
    "this source";
  const empty = !match
    ? {
        title: "Pick a source",
        description: isRuntimeAvailable
          ? "Choose where to read this manga."
          : RUNTIME_UNAVAILABLE,
      }
    : match.manga === undefined
      ? {
          title: `Couldn't search ${sourceName}`,
          description: "Pull to refresh to try again.",
        }
      : match.manga === null
        ? {
            title: "No match",
            description: `This title wasn't found in ${sourceName}.`,
            actions: [
              {
                label: `Search on ${sourceName}`,
                // The sheet opens raised, with this source searching.
                onPress: () => {
                  if (manga)
                    void startTitleSearch(
                      manga.id,
                      [match.sourceId],
                      searchTitles(manga).search[0] ?? "",
                    );
                  router.push(sourceListHref(id, true));
                },
              },
              {
                label: "Choose another source",
                onPress: () => router.push(sourceListHref(id)),
              },
            ],
          }
        : error
          ? { title: "Couldn't load chapters", description: error }
          : { title: "No chapters available" };

  if (loading || !manga) {
    return (
      <>
        <Stack.Title large>{manga?.title?.userPreferred}</Stack.Title>
        <Host className="flex-1">
          {loading ? (
            <LoadingState />
          ) : (
            <EmptyState
              title="Manga not found"
              description="We couldn't find this manga on AniList."
            />
          )}
        </Host>
      </>
    );
  }

  return (
    <>
      <Stack.Title large>{manga.title?.userPreferred}</Stack.Title>
      {Platform.OS === "web" && (
        // A title function is never large: the header stays bare at the top.
        <Stack.Screen
          options={{
            headerTitle: ({ children }) => (
              <Computed>
                {() => (
                  <Typography
                    type="h2"
                    numberOfLines={1}
                    aria-hidden={!titleOut$.get()}
                    className={cn(
                      "transition-opacity duration-300",
                      !titleOut$.get() && "opacity-0",
                    )}
                  >
                    {children}
                  </Typography>
                )}
              </Computed>
            ),
          }}
        />
      )}
      <DetailToolbar
        id={id}
        manga={manga}
        chapters={rows}
        match={match}
        sourceName={sourceName}
        refreshing={refreshing}
        onRefresh={refreshAll}
      />

      <DetailList
        manga={manga}
        refreshing={refreshing}
        onRefresh={refreshAll}
        maxHeaderHeight={maxHeaderHeight}
        chapters={rows}
        total={manga.chapters ?? rows.length}
        loading={matching || chaptersLoading || (!!pendingId && !resumed)}
        empty={empty}
        continue$={continue$}
        onContinue={openContinue}
        titleOut$={titleOut$}
      />
      <ContinueSync
        manga={manga}
        chapters={rows}
        match={match}
        continue$={continue$}
      />
    </>
  );
}
