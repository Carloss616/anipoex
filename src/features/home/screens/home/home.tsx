import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { Button } from "panelui-web/button";
import { useRef } from "react";
import { ScrollView, View } from "react-native";
import type { SearchBarCommands } from "react-native-screens";
import { EmptyState } from "@/components/blocks/empty-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { SECTIONS, type SectionId } from "../../constants";
import { useHomeSections } from "../../hooks/use-home-sections";
import { useVisibleSections } from "../../hooks/use-visible-sections";
import { HomeSection } from "./components/home-section";
import { SearchSuggestions } from "./components/search-suggestions";
import { useHomeSearch } from "./hooks/use-home-search";
import { useSizeClass } from "./hooks/use-size-class";

/** Web: the sections as Frames, activity in a side column when expanded. */
export function Home() {
  const searchBarTheme = useStackSearchBarTheme();
  const headerScroll = useHeaderScroll();
  const searchBar = useRef<SearchBarCommands>(null);
  const { draft$, submit } = useHomeSearch();
  const drafting = useValue(() => draft$.get().trim() !== "");

  // The field keeps its text after a push: clear it so Back finds Home.
  const search = (q: string) => {
    searchBar.current?.cancelSearch();
    submit(q);
  };

  return (
    <>
      <Stack.Title large>Home</Stack.Title>
      <Stack.SearchBar
        ref={searchBar}
        placeholder="Search AniList"
        hideWhenScrolling={false}
        onChangeText={(e) => draft$.set(e.nativeEvent.text)}
        onSearchButtonPress={(e) => search(e.nativeEvent.text)}
        onCancelButtonPress={() => draft$.set("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
      {/* The sections run under the header, which blurs them once scrolled. */}
      <ScrollView className="flex-1" {...headerScroll}>
        <HeaderInsetView className="gutters gap-4 px-gx pt-2 pb-gb">
          {drafting ? (
            <SearchSuggestions draft$={draft$} onSubmit={search} />
          ) : (
            <Sections />
          )}
        </HeaderInsetView>
      </ScrollView>
    </>
  );
}

function Sections() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const expanded = useSizeClass() === "expanded";
  const visible = useVisibleSections();
  const { data, loading, error, refetch } = useHomeSections(visible);
  const side = expanded
    ? visible.filter((id) => SECTIONS[id].kind === "activity")
    : [];
  const main = visible.filter((id) => !side.includes(id));
  const section = (id: SectionId) => (
    <HomeSection key={id} id={id} data={data} loading={loading} />
  );

  const column = (
    <View className="min-w-0 flex-1 gap-4">
      {main.map(section)}
      {error && !data && (
        <EmptyState
          title="Couldn't load Home"
          actions={[{ label: "Try again", onPress: refetch }]}
        />
      )}
      <View className="items-center">
        <Button variant="ghost" onClick={() => router.push("/settings/layout")}>
          Customize home
        </Button>
      </View>
    </View>
  );

  if (!side.length) return column;
  return (
    <View className="flex-row items-start gap-4">
      {column}
      <View className="sticky w-75 gap-4" style={{ top: headerHeight + 8 }}>
        {side.map(section)}
      </View>
    </View>
  );
}
