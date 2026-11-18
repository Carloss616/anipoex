import {
  type ToggleableState,
  TriStateCheckbox,
} from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { cycleFilter, listOptions$ } from "@/features/manga/state/list-options";
import type { TriState } from "@/features/manga/utils/list-options";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { FILTER_LABELS, FILTER_STATE_TEXT, SHOWN_FILTERS } from "../constants";
import { filterA11y } from "../utils/labels";
import type { FilterRowProps } from "./filter-row";

const CHECKBOX_STATE: Record<TriState, ToggleableState> = {
  any: "off",
  include: "on",
  exclude: "indeterminate",
};

export const FilterRow = memo(function FilterRow({
  filter,
  index,
}: FilterRowProps) {
  const state = useValue(() => listOptions$.filters[filter].get());
  const m3 = useThemeM3Colors();
  const excluded = state === "exclude";

  return (
    <SegmentedListItem
      index={index}
      count={SHOWN_FILTERS.length}
      onPress={() => cycleFilter(filter)}
      modifiers={[semantics({ contentDescription: filterA11y(filter, state) })]}
    >
      <SegmentedListItem.Leading>
        <TriStateCheckbox
          state={CHECKBOX_STATE[state]}
          colors={{
            checkedColor: excluded ? m3.error : m3.primary,
            checkmarkColor: excluded ? m3.onError : m3.onPrimary,
          }}
        />
      </SegmentedListItem.Leading>
      <Text>{FILTER_LABELS[filter]}</Text>
      {/* Always mounted: a Compose slot added later doesn't show. */}
      <SegmentedListItem.Trailing>
        <Text style={{ typography: "bodyMedium" }} color={m3.onSurfaceVariant}>
          {FILTER_STATE_TEXT[state]}
        </Text>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );
});
