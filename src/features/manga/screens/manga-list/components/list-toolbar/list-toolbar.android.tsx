import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Toolbar } from "@/components/layout/toolbar";
import { Icons } from "@/components/ui/icon";
import { ALL, genresOf } from "@/features/manga/hooks/use-manga-list";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { openViewSheet } from "../view-sheet";
import type { ListToolbarProps } from "./list-toolbar";

/** Android: the shown page's genre and the view sheet; the tabs switch the list. */
export function ListToolbar({ list$ }: ListToolbarProps) {
  const m3 = useThemeM3Colors();
  const genre = useValue(list$.genre);
  const genres = genresOf(useValue(list$.entries));

  return (
    <Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={Icons.tag}
          tintColor={genre !== ALL ? m3.primary : undefined}
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
      </Stack.Toolbar>
    </Toolbar>
  );
}
