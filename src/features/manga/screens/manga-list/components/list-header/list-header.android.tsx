import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { Row } from "@/components/layout/row";
import { Chip } from "@/components/ui/chip";
import { EnsureHost } from "@/components/ui/host";
import { Menu } from "@/components/ui/menu";
import { ALL } from "@/features/manga/hooks/use-manga-list";
import type { ListHeaderProps } from "./list-header";

/** One genre chip: a dropdown, not 20 chips. The view options live in the toolbar. */
export const ListHeader = memo(function ListHeader({
  genre$,
  genres$,
}: ListHeaderProps) {
  const genre = useValue(genre$);
  const genres = useValue(genres$);

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <Row className="px-safe-offset-gx pt-2">
        <Menu
          items={genres.map(({ name, selected }) => ({
            label: name,
            checked: selected,
            onPress: () => genre$.set(name),
          }))}
        >
          <Chip selected={genre !== ALL}>
            <Chip.Label>{genre === ALL ? "Genre" : genre}</Chip.Label>
          </Chip>
        </Menu>
      </Row>
    </EnsureHost>
  );
});
