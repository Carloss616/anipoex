import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useMemo, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { TabView } from "react-native-tab-view";
import { TabBar } from "@/components/layout/tab-bar";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { useMangaLists } from "../../hooks/use-manga-lists";
import { ListScene } from "./components/list-scene";

export function MangaList() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { height, width } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const [query, setQuery] = useState("");
  const searchBarTheme = useStackSearchBarTheme();
  const large = height > 640;

  const lists = useMangaLists();
  const routes = useMemo(
    () => lists.map((l) => ({ key: l.name, title: l.name })),
    [lists],
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
          <ListScene
            entries={lists.find((l) => l.name === route.key)?.entries ?? []}
            query={query}
          />
        )}
        renderTabBar={(props) => <TabBar {...props} />}
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
