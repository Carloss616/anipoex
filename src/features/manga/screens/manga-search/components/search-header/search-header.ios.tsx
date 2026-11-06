import { Stack } from "expo-router";
import { type RefObject, useCallback, useRef } from "react";
import type { SearchBarCommands } from "react-native-screens";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import type { SearchHeaderProps } from "./search-header";

/** The native bar holds the search, set through its ref. */
export function SearchHeader({ query = "", onSubmit }: SearchHeaderProps) {
  const searchBarTheme = useStackSearchBarTheme();
  const bar = useRef<SearchBarCommands>(null);
  const applied = useRef<string>(undefined);
  // A callback ref, since the bar mounts after this screen's effects have
  // run; it hands its handle over on every render, so each query goes once.
  const attach = useCallback(
    (commands: SearchBarCommands | null) => {
      bar.current = commands;
      if (!commands || applied.current === query) return;
      applied.current = query;
      commands.setText(query);
    },
    [query],
  );

  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar
        ref={attach as unknown as RefObject<SearchBarCommands>}
        placeholder="Search AniList"
        hideWhenScrolling={false}
        onSearchButtonPress={(e) => onSubmit(e.nativeEvent.text)}
        // Cancel stops an edit: the results are still the URL's search.
        onCancelButtonPress={() => bar.current?.setText(query)}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
    </>
  );
}
