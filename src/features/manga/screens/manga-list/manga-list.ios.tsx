import { useObservable, useValue } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import {
  MANGA_STATUS_ENTRIES,
  MANGA_STATUSES,
} from "@/features/manga/constants";
import { ALL, useMangaList } from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { parseList } from "@/features/manga/utils/parse-list";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { ListGrid } from "./components/list-grid";
import { openViewSheet, ViewSheet } from "./components/view-sheet";
import { LIST_SYMBOLS } from "./constants";
import { useSearchQuery } from "./hooks/use-search-query";

const mangaCount = (count: number) =>
  `${count} ${count === 1 ? "manga" : "mangas"}`;

/**
 * iOS: one list at a time, named in the large title. A toolbar menu switches it
 * and picks the genre; a second button opens the view sheet. The menu sits
 * inline: `Stack.Toolbar` only reads its direct children, so a wrapper component
 * would be dropped.
 */
export function MangaList() {
  const { height } = useWindowDimensions();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const status = parseList(list);
  const counts = useMangaListCounts();
  const searchBarTheme = useStackSearchBarTheme();
  const { query$, setQuery } = useSearchQuery();
  const genre$ = useObservable(ALL);
  const mangaList = useMangaList(status, query$, genre$);
  const router = useRouter();
  const genres = useValue(mangaList.genres$);
  const large = height > 640;

  return (
    <>
      <Stack.Title large={large}>{MANGA_STATUSES[status]}</Stack.Title>
      <Stack.SearchBar
        placeholder={
          counts[status] == null
            ? "Search..."
            : `Search ${mangaCount(counts[status])}...`
        }
        placement={large ? "stacked" : "integrated"}
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
        shouldShowHintSearchIcon={false}
        {...searchBarTheme}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon="line.3.horizontal.decrease"
          accessibilityLabel="List and genre"
        >
          <Stack.Toolbar.Menu inline title="List">
            {MANGA_STATUS_ENTRIES.map(([key, name]) => {
              const count = counts[key];
              return (
                <Stack.Toolbar.MenuAction
                  key={key}
                  icon={LIST_SYMBOLS[key]}
                  isOn={key === status}
                  subtitle={count == null ? undefined : mangaCount(count)}
                  onPress={() => {
                    genre$.set(ALL);
                    router.setParams({ list: key });
                  }}
                >
                  {name}
                </Stack.Toolbar.MenuAction>
              );
            })}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu title="Genre" icon="tag">
            {genres.map(({ name, selected }) => (
              <Stack.Toolbar.MenuAction
                key={name}
                isOn={selected}
                onPress={() => genre$.set(name)}
              >
                {name}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Button
          icon="square.grid.2x2"
          onPress={openViewSheet}
          accessibilityLabel="View options"
        />
      </Stack.Toolbar>
      <ListGrid list={mangaList} query$={query$} genre$={genre$} />
      <ViewSheet />
    </>
  );
}
