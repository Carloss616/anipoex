import { type NativeStackNavigationOptions, Stack } from "expo-router";
import { useStackSearchBarTheme } from "@/hooks/use-theme";

export interface SearchHeaderProps {
  query?: string;
  onSubmit: (text: string) => void;
}

/** The field holds the search: our Android and web headers read `searchText`. */
export function SearchHeader({ query = "", onSubmit }: SearchHeaderProps) {
  const searchBarTheme = useStackSearchBarTheme();

  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.Screen
        options={{ searchText: query } as NativeStackNavigationOptions}
      />
      <Stack.SearchBar
        placeholder="Search AniList"
        hideWhenScrolling={false}
        onSearchButtonPress={(e) => onSubmit(e.nativeEvent.text)}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
    </>
  );
}
