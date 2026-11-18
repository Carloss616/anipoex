import { useObservable } from "@legendapp/state/react";
import {
  Stack,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useId } from "react";
import { ScrollView, View } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import {
  ALL,
  emptyMangaList,
  useMangaList,
} from "@/features/manga/hooks/use-manga-list";
import {
  useCustomLists,
  useMangaListCounts,
} from "@/features/manga/hooks/use-manga-list-counts";
import {
  type ListKey,
  listTitle,
  parseList,
} from "@/features/manga/utils/parse-list";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { useScrollSync } from "@/hooks/use-scroll-sync";
import { useSearchQuery } from "@/hooks/use-search-query";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { ListGrid } from "./components/list-grid";
import { ListHeader } from "./components/list-header";
import { ListRedirect } from "./components/list-redirect";
import { ListSidebar } from "./components/list-sidebar";
import { ListToolbar } from "./components/list-toolbar";
import { OptionsSheet } from "./components/options-sheet";

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
  const customLists = useCustomLists();
  const { query$, setQuery } = useSearchQuery();
  const list$ = useObservable(emptyMangaList());
  const genre$ = list$.genre;
  const mangaList = useMangaList(status, query$, list$);
  const wide = isAtLeast("md");
  const large = height > 640;
  const covered = usePathname() === "/manga/custom-lists";
  const headerScroll = useHeaderScroll();
  // Relative, as in the manga detail: the sidebar is far shorter than the grid.
  const syncKey = useId();
  const sidebarSync = useScrollSync({ syncKey, syncType: "relative" });
  const gridSync = useScrollSync({ syncKey, syncType: "relative" });

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
      {/* The grid runs under the header, which blurs it once scrolled. */}
      <View className="flex-1 flex-row">
        {wide && (
          <ScrollView
            ref={sidebarSync.ref}
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            {...headerScroll}
            onScroll={(event) => {
              headerScroll.onScroll?.(event);
              sidebarSync.onScroll?.(event);
            }}
            onScrollBeginDrag={sidebarSync.setActive}
          >
            <HeaderInsetView className="gutters pb-gb pl-gx box-content w-48 pr-4">
              <ListSidebar
                status={status}
                counts={counts}
                customLists={customLists}
                onSelect={select}
                className="pt-4"
              />
            </HeaderInsetView>
          </ScrollView>
        )}
        <ListGrid
          list={mangaList}
          query$={query$}
          genre$={genre$}
          covered={covered}
          scrollSync={gridSync}
          header={
            <HeaderInsetView>
              <ListHeader genre$={genre$} list={mangaList} />
            </HeaderInsetView>
          }
        />
      </View>
      <OptionsSheet />
    </>
  );
}
