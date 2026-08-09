import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useMemo, useRef } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { TabView } from "react-native-tab-view";
import { TabBar } from "@/components/layout/tab-bar";
import { MediaListStatus } from "@/graphql/types";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { ListScene } from "./components/list-scene";
import { MANGA_STATUSES } from "./constants";

export function MangaList() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { height, width } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const searchBarTheme = useStackSearchBarTheme();
  const large = height > 640;

  const query$ = useObservable("");
  const counts$ = useObservable<Record<MediaListStatus, number | null>>({
    [MediaListStatus.Current]: null,
    [MediaListStatus.Planning]: null,
    [MediaListStatus.Completed]: null,
    [MediaListStatus.Dropped]: null,
    [MediaListStatus.Paused]: null,
    [MediaListStatus.Repeating]: null,
  });

  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const setQuery = (text: string) => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => query$.set(text), 150);
  };

  const routes = useMemo(
    () => MANGA_STATUSES.map((s) => ({ key: s.status, title: s.title })),
    [],
  );

  // the URL is the source of truth, so a deep link lands on the right tab
  const index = Math.max(
    0,
    routes.findIndex((r) => r.key === list),
  );

  return (
    <>
      <Stack.Title large={large}>Manga</Stack.Title>
      <Stack.SearchBar
        placeholder="Search..."
        placement={large ? "stacked" : "integrated"}
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />

      <TabView
        navigationState={{ index, routes }}
        onIndexChange={(i) => router.setParams({ list: routes[i].key })}
        renderScene={({ route }) => (
          <ListScene status={route.key} query$={query$} counts$={counts$} />
        )}
        renderTabBar={(props) => <TabBar {...props} counts$={counts$} />}
        initialLayout={{ width }}
        style={{
          paddingTop: Platform.select({
            ios: headerHeight,
            default: undefined,
          }),
        }}
        lazy
      />
    </>
  );
}
