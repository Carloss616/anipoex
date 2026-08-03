import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { TabView as TabViewBase } from "react-native-tab-view";
import { withUniwind } from "uniwind";
import { TabBar } from "@/components/layout/tab-bar";
import { MangaList } from "@/features/manga/screens/manga-list";
import { useMangaLists } from "@/features/manga/use-manga-lists";

const TabView = withUniwind(TabViewBase);

export default function MangaScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { width } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const [query, setQuery] = useState("");

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
      <Stack.Title large>Manga</Stack.Title>
      <Stack.SearchBar
        placeholder="Search..."
        placement="automatic"
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
      />

      <TabView
        navigationState={{ index, routes }}
        onIndexChange={(i) => router.setParams({ list: routes[i].key })}
        renderScene={({ route }) => (
          <MangaList
            entries={lists.find((l) => l.name === route.key)?.entries ?? []}
            query={query}
          />
        )}
        renderTabBar={(props) => <TabBar {...props} />}
        initialLayout={{ width }}
        style={{ paddingTop: headerHeight }}
        lazy
      />
    </>
  );
}
