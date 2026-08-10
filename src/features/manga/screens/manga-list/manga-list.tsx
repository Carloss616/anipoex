import { useObservable } from "@legendapp/state/react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useThemeColor } from "heroui-native/hooks";
import { useMemo, useRef } from "react";
import { Platform, useWindowDimensions, type ViewStyle } from "react-native";
import Animated, { type CSSAnimationProperties } from "react-native-reanimated";
import { TabView } from "react-native-tab-view";
import { TabBar } from "@/components/layout/tab-bar";
import { CloseButton } from "@/components/ui/close-button";
import { Icon } from "@/components/ui/icon";
import { MediaListStatus } from "@/graphql/types";
import {
  useStackSearchBarTheme,
  useStackToolbarTheme,
} from "@/hooks/use-theme";
import { ListScene } from "./components/list-scene";
import { MANGA_LIST_KEY, MANGA_STATUSES } from "./constants";

const SPIN: CSSAnimationProperties<ViewStyle> = {
  animationName: { to: { transform: [{ rotate: "360deg" }] } },
  animationDuration: "1s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
};

export function MangaList() {
  const router = useRouter();
  const muted = useThemeColor("muted");
  const queryClient = useQueryClient();
  const isRefetching = useIsFetching({ queryKey: MANGA_LIST_KEY }) > 0;
  const headerHeight = useHeaderHeight();
  const { height, width } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const searchBarTheme = useStackSearchBarTheme();
  const toolbarTheme = useStackToolbarTheme();
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

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: MANGA_LIST_KEY });

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
      <Stack.Toolbar placement="right" {...toolbarTheme}>
        <Stack.Toolbar.Button
          icon={Icon.select({
            ios: "arrow.clockwise",
            android: require("@expo/material-symbols/refresh.xml"),
          })}
          onPress={refresh}
          disabled={isRefetching}
          tintColor={isRefetching ? muted : undefined}
        />
      </Stack.Toolbar>

      {Platform.OS === "web" && (
        <Stack.Screen
          options={{
            headerRight: ({ tintColor }) => (
              <CloseButton
                className="h-10"
                isDisabled={isRefetching}
                onPress={refresh}
                accessibilityLabel="Refresh"
              >
                <Animated.View style={isRefetching ? SPIN : undefined}>
                  <Icon name="refresh-cw" size={18} color={tintColor} />
                </Animated.View>
              </CloseButton>
            ),
          }}
        />
      )}

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
