import { Button, LazyVStack, ScrollView } from "@expo/ui/swift-ui";
import { buttonStyle, frame, padding } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { useRef } from "react";
import type { SearchBarCommands } from "react-native-screens";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { useHomeSections } from "../../hooks/use-home-sections";
import { useVisibleSections } from "../../hooks/use-visible-sections";
import { HomeSection } from "./components/home-section";
import { SearchSuggestions } from "./components/search-suggestions";
import { useHomeSearch } from "./hooks/use-home-search";

export function Home() {
  const searchBarTheme = useStackSearchBarTheme();
  const searchBar = useRef<SearchBarCommands>(null);
  const { draft$, submit } = useHomeSearch();
  const drafting = useValue(() => draft$.get().trim() !== "");

  // The bar keeps its text after a push: clear it so Back finds Home.
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
      <Host className="flex-1">
        {drafting ? (
          <SearchSuggestions draft$={draft$} onSubmit={search} />
        ) : (
          <Sections />
        )}
      </Host>
    </>
  );
}

function Sections() {
  const router = useRouter();
  const visible = useVisibleSections();
  const { data, loading, error, refetch } = useHomeSections(visible);
  const buttonFont = useFont("body");

  if (error && !data) {
    return (
      <EmptyState
        title="Couldn't load Home"
        actions={[{ label: "Try again", onPress: refetch }]}
      />
    );
  }

  return (
    <ScrollView>
      <LazyVStack
        alignment="leading"
        spacing={24}
        modifiers={[padding({ top: 8, bottom: GUTTER })]}
      >
        {visible.map((id) => (
          <HomeSection key={id} id={id} data={data} loading={loading} />
        ))}
        <Button
          label="Customize Home"
          onPress={() => router.push("/settings/layout")}
          modifiers={[
            buttonStyle("borderless"),
            buttonFont,
            frame({ maxWidth: Infinity }),
          ]}
        />
      </LazyVStack>
    </ScrollView>
  );
}
