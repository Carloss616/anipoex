import { FilterChip, LazyRow } from "@expo/ui/jetpack-compose";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import type { ListHeaderProps } from "./list-header";

/**
 * The page's genres as M3 filter chips, "All genres" first; the list's first
 * item, so it scrolls away with the covers.
 */
export const ListHeader = memo(function ListHeader({
  genre$,
  list,
}: ListHeaderProps) {
  const genres = useValue(list.genres$);
  const insets = useSafeAreaInsets();
  // Only "All genres": nothing to pick from.
  if (genres.length < 2) return null;

  return (
    <LazyRow
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}
      contentPadding={{
        start: GUTTER + insets.left,
        end: GUTTER + insets.right,
      }}
    >
      {genres.map(({ name, selected }) => (
        <FilterChip
          key={name}
          selected={selected}
          onClick={() => genre$.set(name)}
        >
          {selected && (
            <FilterChip.LeadingIcon>
              <Icon name={Icons.check} size={18} color="inherit" />
            </FilterChip.LeadingIcon>
          )}
          <FilterChip.Label>
            <Text style={{ typography: "labelLarge" }}>{name}</Text>
          </FilterChip.Label>
        </FilterChip>
      ))}
    </LazyRow>
  );
});
