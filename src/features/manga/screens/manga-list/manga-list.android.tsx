import GridViewIcon from "@expo/material-symbols/grid_view.xml";
import { Box } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { Toolbar } from "@/components/layout/toolbar";
import { Host } from "@/components/ui/host";
import { TabbedPager } from "@/components/ui/tabbed-pager";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { parseList } from "@/features/manga/utils/parse-list";
import { useFontFamily } from "@/hooks/use-font";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { ListPage } from "./components/list-page";
import { openViewSheet, ViewSheet } from "./components/view-sheet";
import { useSearchQuery } from "./hooks/use-search-query";

/** Android: M3 tabs over a native pager; a page loads the first time it's shown. */
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
  const large = height > 640;

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
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={GridViewIcon}
            onPress={openViewSheet}
            accessibilityLabel="View options"
          />
        </Stack.Toolbar>
      </Toolbar>
      <View className="flex-1" style={{ paddingTop: headerHeight }}>
        <Host className="flex-1">
          <TabbedPager
            tabs={MANGA_STATUS_ENTRIES.map(([key, title]) => ({
              title,
              count: counts[key] ?? undefined,
            }))}
            page={page}
            fontFamily={fontFamily}
            onPageChange={(index) =>
              router.setParams({ list: MANGA_STATUS_ENTRIES[index][0] })
            }
            modifiers={[fillMaxSize()]}
          >
            {MANGA_STATUS_ENTRIES.map(([key]) =>
              visited.has(key) ? (
                <ListPage key={key} status={key} query$={query$} />
              ) : (
                <Box key={key} modifiers={[fillMaxSize()]} />
              ),
            )}
          </TabbedPager>
        </Host>
      </View>
      <ViewSheet />
    </>
  );
}
