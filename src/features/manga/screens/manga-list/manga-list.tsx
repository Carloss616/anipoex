import { useObservable } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { HeaderInset } from "@/components/layout/header-inset";
import {
  ALL,
  emptyMangaList,
  useMangaList,
} from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { parseList } from "@/features/manga/utils/parse-list";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { MANGA_STATUSES } from "../../constants";
import { ListGrid } from "./components/list-grid";
import { ListHeader } from "./components/list-header";
import { ListSidebar } from "./components/list-sidebar";
import { ListToolbar } from "./components/list-toolbar";
import { ViewSheet } from "./components/view-sheet";
import { useSearchQuery } from "./hooks/use-search-query";

/**
 * Web: the lists in a sidebar, the open one as the title. Below `md` the
 * sidebar and the genre dropdown fold into the toolbar.
 */
export function MangaList() {
  const router = useRouter();
  const searchBarTheme = useStackSearchBarTheme();
  const { isAtLeast, height } = useBreakpoint();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const status = parseList(list);
  const counts = useMangaListCounts();
  const { query$, setQuery } = useSearchQuery();
  const list$ = useObservable(emptyMangaList());
  const genre$ = list$.genre;
  const mangaList = useMangaList(status, query$, list$);
  const wide = isAtLeast("md");
  const large = height > 640;

  const select = (key: MediaListStatus) => {
    // A genre picked in one list may not exist in the next.
    genre$.set(ALL);
    router.setParams({ list: key });
  };

  return (
    <>
      <Stack.Title large={large}>{MANGA_STATUSES[status]}</Stack.Title>
      <Stack.SearchBar
        placeholder="Search..."
        placement={large ? "stacked" : "integrated"}
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
      <ListToolbar status={status} list$={list$} onSelect={select} />
      <HeaderInset className="flex-1 flex-row">
        {wide && (
          <ListSidebar status={status} counts={counts} onSelect={select} />
        )}
        <ListGrid
          list={mangaList}
          query$={query$}
          genre$={genre$}
          header={<ListHeader genre$={genre$} list={mangaList} />}
        />
      </HeaderInset>
      <ViewSheet />
    </>
  );
}
