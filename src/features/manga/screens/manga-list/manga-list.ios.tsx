import { useObservable, useValue } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useWindowDimensions } from "react-native";
import {
  MANGA_STATUS_ENTRIES,
  MANGA_STATUSES,
} from "@/features/manga/constants";
import { ALL, useMangaList } from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { listView$ } from "@/features/manga/state/list-view";
import {
  columnOptions,
  columnsFor,
  toTitlePosition,
} from "@/features/manga/utils/list-view";
import { parseList } from "@/features/manga/utils/parse-list";
import { useStackSearchBarTheme } from "@/hooks/use-theme";
import { ListScene } from "./components/list-scene";
import { LIST_SYMBOLS } from "./constants";
import { useSearchQuery } from "./hooks/use-search-query";

/**
 * iOS: one list at a time, named in the large title. One toolbar menu switches
 * it and holds the genre and view options. The menu sits inline: `Stack.Toolbar`
 * only reads its direct children, so a wrapper component would be dropped.
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
  const { current } = useBreakpoint();
  const genres = useValue(mangaList.genres$);
  const columns = columnsFor(current, useValue(listView$.density));
  const title = toTitlePosition(useValue(listView$.title));
  const large = height > 640;

  return (
    <>
      <Stack.Title large={large}>{MANGA_STATUSES[status]}</Stack.Title>
      <Stack.SearchBar
        placeholder="Search"
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
          accessibilityLabel="List and view options"
        >
          <Stack.Toolbar.Menu inline title="List">
            {MANGA_STATUS_ENTRIES.map(([key, name]) => (
              <Stack.Toolbar.MenuAction
                key={key}
                icon={LIST_SYMBOLS[key]}
                isOn={key === status}
                subtitle={
                  counts[key] == null ? undefined : `${counts[key]} manga`
                }
                onPress={() => {
                  // A genre picked in one list may not exist in the next.
                  genre$.set(ALL);
                  router.setParams({ list: key });
                }}
              >
                {name}
              </Stack.Toolbar.MenuAction>
            ))}
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
          <Stack.Toolbar.Menu title="Columns" icon="square.grid.3x3">
            {columnOptions(current).map((option) => (
              <Stack.Toolbar.MenuAction
                key={option.density}
                isOn={option.columns === columns}
                onPress={() => listView$.density.set(option.density)}
              >
                {`${option.columns} columns`}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu title="Title" icon="textformat">
            <Stack.Toolbar.MenuAction
              icon="text.below.photo"
              isOn={title === "below"}
              onPress={() => listView$.title.set("below")}
            >
              Below cover
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="photo"
              isOn={title === "over"}
              onPress={() => listView$.title.set("over")}
            >
              On cover
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <ListScene list={mangaList} query$={query$} genre$={genre$} />
    </>
  );
}
