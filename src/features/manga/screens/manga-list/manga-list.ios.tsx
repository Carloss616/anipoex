import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { Host } from "@/components/ui/host";
import {
  ALL,
  emptyMangaList,
  useMangaList,
} from "@/features/manga/hooks/use-manga-list";
import {
  type ListKey,
  listTitle,
  parseList,
} from "@/features/manga/utils/parse-list";
import { useSearchQuery } from "@/hooks/use-search-query";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { ListGrid } from "./components/list-grid";
import { ListRedirect } from "./components/list-redirect";
import { ListToolbar } from "./components/list-toolbar";
import { ViewSheet } from "./components/view-sheet";

/**
 * iOS: one list at a time, named in the large title; the toolbar switches it
 * and picks the genre.
 */
export function MangaList() {
  const { height } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const status = parseList(list);
  const searchBarTheme = useStackSearchBarTheme();
  const { query$, setQuery } = useSearchQuery();
  const list$ = useObservable(emptyMangaList());
  const genre$ = list$.genre;
  const mangaList = useMangaList(status, query$, list$);
  const router = useRouter();
  const large = height > 640;

  const select = (key: ListKey) => {
    // A genre picked in one list may not exist in the next.
    genre$.set(ALL);
    router.setParams({ list: key });
  };

  return (
    <>
      <Stack.Title large={large}>{listTitle(status)}</Stack.Title>
      <Stack.SearchBar
        placeholder="Search manga"
        placement={large ? "stacked" : "integrated"}
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
      <ListRedirect list={status} />
      <ListToolbar status={status} list$={list$} onSelect={select} />
      <Host className="flex-1">
        <ListGrid list={mangaList} query$={query$} genre$={genre$} />
        <ViewSheet />
      </Host>
    </>
  );
}
