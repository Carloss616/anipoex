import { IconButton } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState } from "@/components/blocks/loading-state";
import { TopAppBar } from "@/components/native/jetpack-compose/top-app-bar";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import {
  emptyMangaList,
  type MangaListStore,
} from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { parseList } from "@/features/manga/utils/parse-list";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useSearchQuery } from "@/hooks/use-search-query";
import { ListPage } from "./components/list-page";
import { openViewSheet, ViewSheet } from "./components/view-sheet";

/**
 * Android: a search app bar over M3 tabs and a pager, drawn in the screen's own
 * Host instead of the stack header, so the bar and tabs can leave together as
 * a page scrolls. A page loads the first time it's shown.
 */
export function MangaList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const status = parseList(list);
  const page = MANGA_STATUS_ENTRIES.findIndex(([key]) => key === status);
  const counts = useMangaListCounts();
  const { query$, setQuery } = useSearchQuery();
  const [visited, setVisited] = useState(() => new Set([status]));
  const lists$ = useObservable(
    Object.fromEntries(
      MANGA_STATUS_ENTRIES.map(([key]) => [key, emptyMangaList()]),
    ) as Record<MediaListStatus, MangaListStore>,
  );

  const select = (key: MediaListStatus) => router.setParams({ list: key });

  useEffect(() => {
    setVisited((seen) => (seen.has(status) ? seen : new Set(seen).add(status)));
  }, [status]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Host className="flex-1">
        <TopAppBar
          search={{ placeholder: "Search manga", onChangeText: setQuery }}
          scrollBehavior="enterAlways"
          tabs={MANGA_STATUS_ENTRIES.map(([key, title]) => ({
            title,
            count: counts[key] ?? undefined,
          }))}
          page={page}
          // Not M3's 52dp: the labels line up with the search bar and covers.
          tabsEdgePadding={Math.max(insets.left, insets.right)}
          onPageChange={(index) => select(MANGA_STATUS_ENTRIES[index][0])}
          modifiers={[fillMaxSize()]}
        >
          <TopAppBar.Actions>
            <IconButton onClick={openViewSheet}>
              <Icon
                name={Icons.grid}
                accessibilityLabel="View options"
                color="inherit"
              />
            </IconButton>
          </TopAppBar.Actions>
          {MANGA_STATUS_ENTRIES.map(([key]) =>
            visited.has(key) ? (
              <ListPage
                key={key}
                status={key}
                query$={query$}
                list$={lists$[key]}
              />
            ) : (
              <LoadingState key={key} variant="spinner" />
            ),
          )}
        </TopAppBar>
        <ViewSheet />
      </Host>
    </>
  );
}
