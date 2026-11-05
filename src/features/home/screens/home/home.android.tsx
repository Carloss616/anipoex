import TuneIcon from "@expo/material-symbols/tune.xml";
import {
  Box,
  FilledTonalButton,
  LazyColumn,
  Row,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { useHomeSections } from "../../hooks/use-home-sections";
import { useVisibleSections } from "../../hooks/use-visible-sections";
import { HomeSection } from "./components/home-section";
import { SearchSuggestions } from "./components/search-suggestions";
import { useHomeSearch } from "./hooks/use-home-search";

/** The search app bar over one Compose list: suggestions while typing, else the sections. */
export function Home() {
  const { draft$, submit } = useHomeSearch();
  const typing = useValue(() => draft$.get().trim() !== "");
  const searchBarTheme = useStackSearchBarTheme();
  const headerHeight = useHeaderHeight();
  return (
    <>
      <Stack.Title>Home</Stack.Title>
      <Stack.SearchBar
        placeholder="Search AniList"
        hideWhenScrolling={false}
        shouldShowHintSearchIcon={false}
        onChangeText={(e) => draft$.set(e.nativeEvent.text)}
        onSearchButtonPress={(e) => submit(e.nativeEvent.text)}
        {...searchBarTheme}
      />
      <Host className="flex-1" style={{ marginTop: headerHeight }}>
        {typing ? (
          <SearchSuggestions draft$={draft$} onSubmit={submit} />
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
  const setHeaderScrolled = useSetHeaderScrolled();

  if (!visible.length || (error && !data)) {
    return (
      <EmptyState
        title="Nothing on Home"
        description="Check your connection, or turn on some sections."
        actions={[
          { label: "Retry", onPress: refetch },
          {
            label: "Customize home",
            onPress: () => router.push("/settings/layout"),
          },
        ]}
      />
    );
  }

  return (
    <Box modifiers={[fillMaxSize(), pinnedScrollBehavior(setHeaderScrolled)]}>
      <LazyColumn
        modifiers={[fillMaxSize()]}
        contentPadding={{ bottom: GUTTER }}
      >
        {visible.map((id) => (
          <HomeSection key={id} id={id} data={data} loading={loading} />
        ))}
        <Box
          contentAlignment="center"
          modifiers={[fillMaxWidth(), padding(0, 28, 0, 8)]}
        >
          <FilledTonalButton onClick={() => router.push("/settings/layout")}>
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
            >
              <Icon name={TuneIcon} size={18} color="inherit" />
              <Text style={{ typography: "labelLarge" }}>Customize home</Text>
            </Row>
          </FilledTonalButton>
        </Box>
      </LazyColumn>
    </Box>
  );
}
