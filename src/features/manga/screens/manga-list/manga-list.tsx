import { useApolloClient } from "@apollo/client/react";
import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { View } from "react-native";
import { Toolbar } from "@/components/layout/toolbar";
import { Icon } from "@/components/ui/icon";
import {
  ALL,
  REFRESH_QUERIES,
  useMangaList,
} from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { parseList } from "@/features/manga/utils/parse-list";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MANGA_STATUS_ENTRIES, MANGA_STATUSES } from "../../constants";
import { ListHeader } from "./components/list-header";
import { ListScene } from "./components/list-scene";
import { ListSidebar } from "./components/list-sidebar";
import { openViewSheet, ViewSheet } from "./components/view-sheet";
import { useSearchQuery } from "./hooks/use-search-query";

/**
 * Web: the lists in a sidebar, the open one as the title. Below `md` the
 * sidebar folds into a toolbar menu.
 */
export function MangaList() {
  const router = useRouter();
  const client = useApolloClient();
  const mutedForeground = useThemeColor("muted-foreground");
  const headerHeight = useHeaderHeight();
  const searchBarTheme = useStackSearchBarTheme();
  const { isAtLeast, height } = useBreakpoint();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const status = parseList(list);
  const counts = useMangaListCounts();
  const { query$, setQuery } = useSearchQuery();
  const genre$ = useObservable(ALL);
  const mangaList = useMangaList(status, query$, genre$);
  const [refetching, setRefetching] = useState(false);
  const wide = isAtLeast("md");
  const large = height > 640;

  const refresh = () => {
    setRefetching(true);
    client
      .refetchQueries({ include: REFRESH_QUERIES })
      .finally(() => setRefetching(false));
  };

  const select = (key: MediaListStatus) => {
    // A genre picked in one list may not exist in the next.
    genre$.set(ALL);
    router.setParams({ list: key });
  };

  return (
    <>
      <Stack.Title large={large}>{MANGA_STATUSES[status]}</Stack.Title>
      <Stack.SearchBar
        placeholder="Search..."
        placement={large ? "stacked" : "integrated"}
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
      <Toolbar spinning={refetching}>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu
            hidden={wide}
            icon={Icon.select({
              ios: "list.bullet",
              android: require("@expo/material-symbols/list.xml"),
              web: "list",
            })}
            accessibilityLabel="Lists"
          >
            {MANGA_STATUS_ENTRIES.map(([key, name]) => (
              <Stack.Toolbar.MenuAction
                key={key}
                isOn={key === status}
                onPress={() => select(key)}
              >
                {counts[key] == null ? name : `${name} (${counts[key]})`}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Button
            icon={Icon.select({
              ios: "square.grid.2x2",
              android: require("@expo/material-symbols/grid_view.xml"),
              web: "layout-grid",
            })}
            onPress={openViewSheet}
            accessibilityLabel="View options"
          />
          <Stack.Toolbar.Button
            icon={Icon.select({
              ios: "arrow.clockwise",
              android: require("@expo/material-symbols/refresh.xml"),
              web: "refresh-cw",
            })}
            onPress={refresh}
            disabled={refetching}
            tintColor={refetching ? mutedForeground : undefined}
            accessibilityLabel="Refresh"
          />
        </Stack.Toolbar>
      </Toolbar>
      <View className="flex-1 flex-row" style={{ paddingTop: headerHeight }}>
        {wide && (
          <ListSidebar status={status} counts={counts} onSelect={select} />
        )}
        <View className="flex-1">
          <ListScene
            list={mangaList}
            query$={query$}
            genre$={genre$}
            header={<ListHeader genre$={genre$} genres$={mangaList.genres$} />}
          />
        </View>
      </View>
      <ViewSheet />
    </>
  );
}
