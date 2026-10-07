import type { Observable, ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { ALL } from "@/features/manga/hooks/use-manga-list";

export interface ListHeaderProps {
  genre$: ObservablePrimitive<string>;
  genres$: Observable<
    () => {
      name: string;
      selected: boolean;
    }[]
  >;
}

/**
 * Web: one button that opens the genres. Android draws a dropdown chip and a
 * view button instead; iOS keeps the genre in its toolbar menu.
 */
export const ListHeader = memo(function ListHeader({
  genre$,
  genres$,
}: ListHeaderProps) {
  const genres = useValue(genres$);
  const genre = useValue(genre$);

  return (
    <Row className="py-4">
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
          endContent={<Icon name="chevron-down" size={16} />}
        >
          {genre === ALL ? "All genres" : genre}
        </Button>
      </Menu>
    </Row>
  );
});
