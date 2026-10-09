import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { Center } from "@/components/layout/center";
import { Host } from "@/components/ui/host";
import { Loader } from "@/components/ui/loader";
import { TabbedPager } from "@/components/ui/tabbed-pager";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import {
  emptyMangaList,
  type MangaListStore,
} from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { parseList } from "@/features/manga/utils/parse-list";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useFontFamily } from "@/hooks/use-font";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { ListPage } from "./components/list-page";
import { ListToolbar } from "./components/list-toolbar";
import { ViewSheet } from "./components/view-sheet";
import { useSearchQuery } from "./hooks/use-search-query";

/**
 * Android: M3 tabs over a native pager; a page loads the first time it's shown.
 * The screen holds each page's list, so the toolbar picks the shown one's genre.
 */
export function MangaList() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { height } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const status = parseList(list);
  const page = MANGA_STATUS_ENTRIES.findIndex(([key]) => key === status);
  const counts = useMangaListCounts();
  const searchBarTheme = useStackSearchBarTheme();
  const fontFamily = useFontFamily("medium");
  const { query$, setQuery } = useSearchQuery();
  const [visited, setVisited] = useState(() => new Set([status]));
  const lists$ = useObservable(
    Object.fromEntries(
      MANGA_STATUS_ENTRIES.map(([key]) => [key, emptyMangaList()]),
    ) as Record<MediaListStatus, MangaListStore>,
  );
  const large = height > 640;

  const select = (key: MediaListStatus) => router.setParams({ list: key });

  useEffect(() => {
    setVisited((seen) => (seen.has(status) ? seen : new Set(seen).add(status)));
  }, [status]);

  return (
    <>
      <Stack.Title large={large}>Manga</Stack.Title>
      <Stack.SearchBar
        placeholder="Search..."
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
        {...searchBarTheme}
      />
      {/* Keyed: each page has its own `list$`. */}
      <ListToolbar
        key={status}
        status={status}
        list$={lists$[status]}
        onSelect={select}
      />
      <View className="flex-1" style={{ paddingTop: headerHeight }}>
        <Host className="flex-1">
          <TabbedPager
            tabs={MANGA_STATUS_ENTRIES.map(([key, title]) => ({
              title,
              count: counts[key] ?? undefined,
            }))}
            page={page}
            fontFamily={fontFamily}
            tabsClassName="px-safe"
            onPageChange={(index) => select(MANGA_STATUS_ENTRIES[index][0])}
            modifiers={[fillMaxSize()]}
          >
            {MANGA_STATUS_ENTRIES.map(([key]) =>
              visited.has(key) ? (
                <ListPage
                  key={key}
                  status={key}
                  query$={query$}
                  list$={lists$[key]}
                />
              ) : (
                <Center key={key}>
                  <Loader speed={3} size="lg" />
                </Center>
              ),
            )}
          </TabbedPager>
          <ViewSheet />
        </Host>
      </View>
    </>
  );
}
