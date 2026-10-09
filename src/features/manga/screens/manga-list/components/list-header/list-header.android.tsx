import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ActiveFilters } from "@/components/active-filters";
import { mangaCount } from "@/features/manga/constants";
import { ALL } from "@/features/manga/hooks/use-manga-list";
import type { ListHeaderProps } from "./list-header";

/** The genre picked in the toolbar, as a chip that clears it, and the total. */
export const ListHeader = memo(function ListHeader({
  genre$,
  list,
}: ListHeaderProps) {
  const genre = useValue(genre$);
  const shown = useValue(list.manga$).length;

  return (
    <ActiveFilters
      filters={
        genre === ALL ? [] : [{ label: genre, clear: () => genre$.set(ALL) }]
      }
      total={shown > 0 ? mangaCount(shown) : undefined}
    />
  );
});
