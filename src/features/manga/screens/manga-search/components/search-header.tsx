import { Stack } from "expo-router";
import { useStackSearchBarTheme } from "@/hooks/use-theme";

/**
 * The title names the search, and the empty field shows the query too:
 * Android's search bar takes the title's place.
 */
export function SearchHeader({
  title,
  query,
  onSubmit,
}: {
  title: string;
  query?: string;
  onSubmit: (text: string) => void;
}) {
  const searchBarTheme = useStackSearchBarTheme();

  return (
    <>
      <Stack.Title>{title}</Stack.Title>
      <Stack.SearchBar
        placeholder={query || "Search AniList"}
        hideWhenScrolling={false}
        onSearchButtonPress={(e) => onSubmit(e.nativeEvent.text)}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
    </>
  );
}
