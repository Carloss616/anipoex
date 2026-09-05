import { useApolloClient } from "@apollo/client/react";
import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { TabBar, TabView } from "react-native-tab-view";
import { Toolbar } from "@/components/layout/toolbar";
import { Icon } from "@/components/ui/icon";
import { MediaListStatus } from "@/graphql/types.generated";
import { useStackSearchBarTheme, useTabViewTheme } from "@/hooks/use-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MANGA_STATUS_ENTRIES } from "../../constants";
import { ListScene } from "./components/list-scene";
import { TabLabel } from "./components/tab-label";

export function MangaList() {
  const router = useRouter();
  const mutedForeground = useThemeColor("muted-foreground");
  const client = useApolloClient();
  const [refetching, setRefetching] = useState(false);
  const headerHeight = useHeaderHeight();
  const { height, width } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const searchBarTheme = useStackSearchBarTheme();
  const tabViewTheme = useTabViewTheme();
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

  useEffect(() => () => clearTimeout(debounce.current), []);

  const refresh = () => {
    setRefetching(true);
    client
      .refetchQueries({ include: ["MangaList"] })
      .finally(() => setRefetching(false));
  };

  const routes = useMemo(
    () => MANGA_STATUS_ENTRIES.map(([key, title]) => ({ key, title })),
    [],
  );

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
      <Toolbar spinning={refetching}>
        <Stack.Toolbar placement="right">
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

      <TabView
        navigationState={{ index, routes }}
        onIndexChange={(i) => router.setParams({ list: routes[i].key })}
        commonOptions={{
          ...tabViewTheme.commonOptions,
          label: ({ route, color, style }) => (
            <TabLabel
              title={route.title}
              color={color}
              style={style}
              count$={counts$[route.key]}
            />
          ),
        }}
        renderTabBar={(props) => <TabBar {...props} {...tabViewTheme.tabBar} />}
        renderScene={({ route }) => (
          <ListScene status={route.key} query$={query$} counts$={counts$} />
        )}
        initialLayout={{ width }}
        style={{
          paddingTop: headerHeight,
        }}
        lazy
      />
    </>
  );
}
