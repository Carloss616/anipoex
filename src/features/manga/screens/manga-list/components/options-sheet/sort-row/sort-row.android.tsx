import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { chooseSort, listOptions$ } from "@/features/manga/state/list-options";
import { SORT_KEYS } from "@/features/manga/utils/list-options";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { SORT_LABELS } from "../constants";
import { sortA11y } from "../utils/labels";
import type { SortRowProps } from "./sort-row";

export const SortRow = memo(function SortRow({ by, index }: SortRowProps) {
  const label = useValue(() => sortA11y(by, listOptions$.sort.get()));
  const ascending = useValue(() => {
    const sort = listOptions$.sort.get();
    return sort.by === by ? sort.ascending : undefined;
  });
  const m3 = useThemeM3Colors();
  const active = ascending !== undefined;

  return (
    <SegmentedListItem
      index={index}
      count={SORT_KEYS.length}
      selected={active}
      onPress={() => chooseSort(by)}
      modifiers={[semantics({ contentDescription: label })]}
    >
      <Text>{SORT_LABELS[by]}</Text>
      <SegmentedListItem.Trailing>
        {active && (
          <Icon
            name={ascending ? Icons.moveUp : Icons.moveDown}
            color={m3.primary}
          />
        )}
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );
});
