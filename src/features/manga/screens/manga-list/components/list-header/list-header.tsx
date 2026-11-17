import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Button } from "panelui-web/button";
import { memo } from "react";
import { View } from "react-native";
import {
  type ActiveFilter,
  ActiveFilters,
} from "@/components/blocks/active-filters";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { mangaCount } from "@/features/manga/constants";
import {
  ALL,
  type MangaListState,
} from "@/features/manga/hooks/use-manga-list";
import { listOptions$, setFilter } from "@/features/manga/state/list-options";
import {
  FILTER_KEYS,
  type ListFilters,
} from "@/features/manga/utils/list-options";
import { CHIP_LABELS } from "../options-sheet/constants";

const filterChips = (filters: ListFilters): ActiveFilter[] =>
  FILTER_KEYS.filter((key) => filters[key] !== "any").map((key) => ({
    label: CHIP_LABELS[key][filters[key] === "include" ? 0 : 1],
    clear: () => setFilter(key, "any"),
  }));

export interface ListHeaderProps {
  genre$: ObservablePrimitive<string>;
  list: MangaListState;
}

/**
 * Web, like the extensions list: from `md` a genre dropdown and the total;
 * below it the genre sits in the toolbar and shows here as a chip. Each active
 * filter is a chip that clears it.
 */
export const ListHeader = memo(function ListHeader({
  genre$,
  list,
}: ListHeaderProps) {
  const wide = useBreakpoint().isAtLeast("md");
  const genres = useValue(list.genres$);
  const genre = useValue(genre$);
  const chips = useValue(() => filterChips(listOptions$.filters.get()));
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
            <Button variant="outline" size="sm">
              {genre}
              <Icon name={Icons.chevronDown} size={16} />
            </Button>
          </Menu>
          <ActiveFilters filters={chips} total={total} />
        </>
      ) : (
        <ActiveFilters
          filters={
            genre === ALL
              ? chips
              : [{ label: genre, clear: () => genre$.set(ALL) }, ...chips]
          }
          total={total}
        />
      )}
    </View>
  );
});
