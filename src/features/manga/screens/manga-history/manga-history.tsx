import { Stack } from "expo-router";
import type { RefObject } from "react";
import { View } from "react-native";
import type { SearchBarCommands } from "react-native-screens";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { HistoryList } from "./components/history-list";
import { LibraryMatches } from "./components/library-matches";
import { useHistoryFilter } from "./hooks/use-history-filter";
import { useMangaHistory } from "./hooks/use-manga-history";

/**
 * The viewer's list activity, newest first; the search picks a manga of
 * theirs to show only its activity.
 */
export function MangaHistory() {
  const searchBarTheme = useStackSearchBarTheme();
  const filter = useHistoryFilter();
  const history = useMangaHistory(filter.mediaId);

  return (
    <>
      <Stack.Title>History</Stack.Title>
      <Stack.SearchBar
        ref={filter.searchBar as RefObject<SearchBarCommands>}
        placeholder="Search your manga"
        hideWhenScrolling={false}
        onChangeText={(e) => filter.setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => filter.setQuery("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
      <View className="flex-1" aria-hidden={filter.showMatches}>
        <HistoryList history={history} mediaId={filter.mediaId} />
      </View>
      {filter.showMatches && (
        <LibraryMatches query$={filter.query$} onPick={filter.pick} />
      )}
    </>
  );
}
