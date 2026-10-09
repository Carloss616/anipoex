import { useApolloClient } from "@apollo/client/react";
import type { Observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Toolbar } from "@/components/layout/toolbar";
import { Icons } from "@/components/ui/icon";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import {
  ALL,
  genresOf,
  type MangaListStore,
  REFRESH_QUERIES,
} from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useThemeColor } from "@/hooks/use-theme-color";
import { openViewSheet } from "../view-sheet";

export interface ListToolbarProps {
  status: MediaListStatus;
  /** The shown list: its genre is picked here, from the genres it holds. */
  list$: Observable<MangaListStore>;
  onSelect: (status: MediaListStatus) => void;
}

/**
 * Web: below `md` the lists and the genre fold in here as menus; from `md` the
 * sidebar and the header dropdown take them. Its own component, so a genre
 * redraws only the toolbar.
 */
export function ListToolbar({ status, list$, onSelect }: ListToolbarProps) {
  const client = useApolloClient();
  const counts = useMangaListCounts();
  const wide = useBreakpoint().isAtLeast("md");
  const primary = useThemeColor("primary");
  const mutedForeground = useThemeColor("muted-foreground");
  const genre = useValue(list$.genre);
  const genres = genresOf(useValue(list$.entries));
  const [refetching, setRefetching] = useState(false);

  const refresh = () => {
    setRefetching(true);
    client
      .refetchQueries({ include: REFRESH_QUERIES })
      .finally(() => setRefetching(false));
  };

  return (
    <Toolbar spinning={refetching}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          hidden={wide}
          icon={Icons.list}
          accessibilityLabel="Lists"
        >
          {MANGA_STATUS_ENTRIES.map(([key, name]) => (
            <Stack.Toolbar.MenuAction
              key={key}
              isOn={key === status}
              onPress={() => onSelect(key)}
            >
              {counts[key] == null ? name : `${name} (${counts[key]})`}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Menu
          hidden={wide}
          icon={Icons.tag}
          tintColor={genre !== ALL ? primary : undefined}
          accessibilityLabel="Genre"
        >
          {genres.map((name) => (
            <Stack.Toolbar.MenuAction
              key={name}
              isOn={name === genre}
              onPress={() => list$.genre.set(name)}
            >
              {name}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Button
          icon={Icons.grid}
          onPress={openViewSheet}
          accessibilityLabel="View options"
        />
        <Stack.Toolbar.Button
          icon={Icons.refresh}
          onPress={refresh}
          disabled={refetching}
          tintColor={refetching ? mutedForeground : undefined}
          accessibilityLabel="Refresh"
        />
      </Stack.Toolbar>
    </Toolbar>
  );
}
