import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Icons } from "@/components/ui/icon";
import { MANGA_STATUS_ENTRIES, mangaCount } from "@/features/manga/constants";
import { ALL, genresOf } from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import {
  libraryScan$,
  scanReading,
  stopReadingScan,
} from "@/features/manga/state/library-scan";
import { MediaListStatus } from "@/graphql/types.generated";
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
  const scanning = useValue(() => libraryScan$.get() !== null);
  const reading = status === MediaListStatus.Current;

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu
        icon={Icons.filter}
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
        <Stack.Toolbar.Menu title="Genre" icon={Icons.tag}>
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
        icon={Icons.grid}
        onPress={openViewSheet}
        accessibilityLabel="View options"
      />
      <Stack.Toolbar.Menu
        hidden={!reading || scanning}
        icon={Icons.scanList}
        accessibilityLabel="Scan Reading"
      >
        <Stack.Toolbar.MenuAction onPress={() => scanReading()}>
          Scan for new chapters
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          onPress={() => scanReading({ everything: true })}
        >
          Rescan everything
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
      <Stack.Toolbar.Button
        hidden={!reading || !scanning}
        icon={Icons.stop}
        tintColor={primary}
        onPress={stopReadingScan}
        accessibilityLabel="Stop scan"
      />
    </Stack.Toolbar>
  );
}
