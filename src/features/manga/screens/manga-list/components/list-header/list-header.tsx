import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { memo } from "react";
import { View } from "react-native";
import { ActiveFilters } from "@/components/blocks/active-filters";
import { Button } from "@/components/ui/button";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { mangaCount } from "@/features/manga/constants";
import {
  ALL,
  type MangaListState,
} from "@/features/manga/hooks/use-manga-list";

export interface ListHeaderProps {
  genre$: ObservablePrimitive<string>;
  list: MangaListState;
}

/**
 * Web, like the extensions list: from `md` a genre dropdown and the total;
 * below it the genre sits in the toolbar and shows here as a chip.
 */
export const ListHeader = memo(function ListHeader({
  genre$,
  list,
}: ListHeaderProps) {
  const wide = useBreakpoint().isAtLeast("md");
  const genres = useValue(list.genres$);
  const genre = useValue(genre$);
  const total = mangaCount(useValue(list.manga$).length);

  return (
    <View className="flex-row flex-wrap items-center gap-3 py-4">
      {wide ? (
        <>
          <Menu
            align="start"
            items={genres.map(({ name, selected }) => ({
              label: name,
              checked: selected,
              onPress: () => genre$.set(name),
            }))}
          >
            <Button
              variant="outline"
              size="sm"
              endContent={<Icon name={Icons.chevronDown} size={16} />}
            >
              {genre}
            </Button>
          </Menu>
          <ActiveFilters filters={[]} total={total} />
        </>
      ) : (
        <ActiveFilters
          filters={
            genre === ALL
              ? []
              : [{ label: genre, clear: () => genre$.set(ALL) }]
          }
          total={total}
        />
      )}
    </View>
  );
});
