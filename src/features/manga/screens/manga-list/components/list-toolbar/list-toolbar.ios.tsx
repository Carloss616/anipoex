import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { MANGA_STATUS_ENTRIES, mangaCount } from "@/features/manga/constants";
import { ALL, genresOf } from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LIST_SYMBOLS } from "../../constants";
import { openViewSheet } from "../view-sheet";
import type { ListToolbarProps } from "./list-toolbar";

/**
 * iOS: one menu switches the list and picks the genre; a second button opens
 * the view sheet. The menus sit inline: `Stack.Toolbar` only reads its direct
 * children, so a wrapper component would be dropped.
 */
export function ListToolbar({ status, list$, onSelect }: ListToolbarProps) {
  const counts = useMangaListCounts();
  const primary = useThemeColor("primary");
  const genre = useValue(list$.genre);
  const genres = genresOf(useValue(list$.entries));

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu
        icon="line.3.horizontal.decrease"
        tintColor={genre !== ALL ? primary : undefined}
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
                onPress={() => onSelect(key)}
              >
                {name}
              </Stack.Toolbar.MenuAction>
            );
          })}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Menu title="Genre" icon="tag">
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
      </Stack.Toolbar.Menu>
      <Stack.Toolbar.Button
        icon="square.grid.2x2"
        onPress={openViewSheet}
        accessibilityLabel="View options"
      />
    </Stack.Toolbar>
  );
}
