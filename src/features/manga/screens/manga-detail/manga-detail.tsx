import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { LoadingState } from "@/components/blocks/loading-state";
import { Toolbar } from "@/components/layout/toolbar";
import { Host } from "@/components/ui/host";
import { Icons } from "@/components/ui/icon";
import {
  isRuntimeAvailable,
  RUNTIME_UNAVAILABLE,
  refreshInstalled,
  useInstalledSources,
} from "@/features/extensions";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useSourceChapters } from "@/features/manga/hooks/use-source-chapters";
import { useSourceMatch } from "@/features/manga/hooks/use-source-match";
import { useSourceSearch } from "@/features/manga/hooks/use-source-search";
import { startTitleSearch } from "@/features/manga/state/title-search";
import { searchTitles } from "@/features/manga/utils/source-match";
import { useMaxHeaderHeight } from "@/hooks/use-max-header-height";
import { useThemeColor } from "@/hooks/use-theme-color";
import { openExternal } from "@/utils/open-external";
import { noop } from "@/utils/utils";
import { DetailHeader } from "./components/detail-header";
import { DetailList } from "./components/detail-list";
import { Hero } from "./components/hero";
import { SourcePicker } from "./components/source-picker";
import { SourceSheet } from "./components/source-sheet";

const MENU_ACTIONS = [
  {
    icon: Icons.share,
    label: "Share",
    onPress: () => noop(),
  },
  {
    icon: Icons.download,
    label: "Download",
    onPress: () => noop(),
  },
  {
    icon: Icons.openExternal,
    // The destination names itself better than "Website" did.
    label: "View on AniList",
    onPress: (id: string) => openExternal(`https://anilist.co/manga/${id}`),
  },
] as const;

export function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const maxHeaderHeight = useMaxHeaderHeight();
  const mutedForeground = useThemeColor("muted-foreground");
  const { manga, loading, refreshing, refresh } = useMangaEntry(id);
  const sources = useInstalledSources();
  const { match, matching } = useSourceMatch(Number(id));
  // An observable, so opening the sheet re-renders neither this screen nor its list.
  const sourceSheet$ = useObservable(false);
  // Destructured so `refreshAll` only changes with the match: each new toolbar re-renders the whole stack.
  const {
    chapters,
    loading: chaptersLoading,
    error,
    refresh: refreshChapters,
  } = useSourceChapters(Number(id), match);

  const { resume } = useSourceSearch(manga);
  const [resumed, setResumed] = useState(false);
  const pendingId = match?.manga === undefined ? match?.sourceId : undefined;

  // A pick without a manga is searched once each time the detail opens; Refresh retries it after that.
  useEffect(() => {
    if (!pendingId || !manga || resumed) return;
    setResumed(true);
    resume(pendingId);
  }, [pendingId, manga, resume, resumed]);

  // A new pick hides the previous source's rows so the loading state shows.
  const rows = matching ? [] : chapters;

  const refreshAll = () =>
    Promise.all([
      refresh(),
      refreshChapters(),
      refreshInstalled(),
      pendingId && resume(pendingId),
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
                  sourceSheet$.set(true);
                },
              },
              {
                label: "Choose another source",
                onPress: () => sourceSheet$.set(true),
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
      <Toolbar spinning={refreshing}>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={Icons.refresh}
            onPress={refreshAll}
            disabled={refreshing}
            tintColor={refreshing ? mutedForeground : undefined}
            accessibilityLabel="Refresh"
          />
          <Stack.Toolbar.Menu
            icon={Icons.more}
            accessibilityLabel="More options"
          >
            {MENU_ACTIONS.map(({ icon, label, onPress }) => (
              <Stack.Toolbar.MenuAction
                key={label}
                icon={icon}
                onPress={() => onPress(id)}
              >
                {label}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      </Toolbar>

      <DetailList
        refreshing={refreshing}
        onRefresh={refreshAll}
        maxHeaderHeight={maxHeaderHeight}
        hero={<Hero manga={manga} maxHeaderHeight={maxHeaderHeight} />}
        chapters={rows}
        total={manga.chapters ?? rows.length}
        loading={matching || chaptersLoading || (!!pendingId && !resumed)}
        empty={empty}
        action={
          <SourcePicker
            manga={manga}
            entryId={manga.mediaListEntry?.id}
            open$={sourceSheet$}
          />
        }
        mediaId={manga.id}
        entryId={manga.mediaListEntry?.id}
        header={<DetailHeader manga={manga} />}
      />
      <SourceSheet
        manga={manga}
        entryId={manga.mediaListEntry?.id}
        open$={sourceSheet$}
      />
    </>
  );
}
