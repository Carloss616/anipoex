import {
  Column,
  type ToggleableState,
  TriStateCheckbox,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  selectableGroup,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { memo } from "react";
import { ButtonGroup } from "@/components/native/jetpack-compose/button-group";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import {
  chooseSort,
  cycleFilter,
  listOptions$,
} from "@/features/manga/state/list-options";
import {
  type FilterKey,
  SORT_KEYS,
  type SortKey,
  type TriState,
} from "@/features/manga/utils/list-options";
import { columnOptions, columnsFor } from "@/features/manga/utils/list-view";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { settings$ } from "@/state/settings";
import { FILTER_LABELS, SHOWN_FILTERS, SORT_LABELS, TABS } from "./constants";
import { filterA11y, sortA11y } from "./utils/labels";
import { open$, tab$ } from "./utils/sheet-state";

export { openOptionsSheet } from "./utils/sheet-state";

const TITLES = [
  ["below", "Below"],
  ["split", "Split"],
  ["over", "Over"],
] as const;

const CHECKBOX_STATE: Record<TriState, ToggleableState> = {
  any: "off",
  include: "on",
  exclude: "indeterminate",
};

const STATE_TEXT: Record<TriState, string> = {
  any: "",
  include: "Only",
  exclude: "Excluded",
};

/**
 * Android: Filter, Sort and Display behind a connected button group, as
 * @expo/ui has no M3 tabs. Rendered once by the screen, outside the grid:
 * mounted inside the grid's header, the sheet's node resized the header and
 * the rows jumped as it opened.
 */
export function OptionsSheet() {
  const isPresented = useValue(open$);
  const tab = useValue(tab$);

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Column
        verticalArrangement={{ spacedBy: 12 }}
        modifiers={[fillMaxWidth(), padding(24, 0, 24, 32)]}
      >
        <Text style={{ typography: "titleLarge" }}>Options</Text>
        <ButtonGroup
          options={TABS.map(([, label]) => label)}
          selected={[TABS.findIndex(([value]) => value === tab)]}
          onChange={(index) => tab$.set(TABS[index][0])}
          modifiers={[fillMaxWidth()]}
        />
        {tab === "filter" && (
          <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
            {SHOWN_FILTERS.map((key, index) => (
              <FilterRow key={key} filter={key} index={index} />
            ))}
          </Column>
        )}
        {tab === "sort" && (
          <Column
            verticalArrangement={{ spacedBy: SEGMENTED_GAP }}
            modifiers={[selectableGroup()]}
          >
            {SORT_KEYS.map((key, index) => (
              <SortRow key={key} by={key} index={index} />
            ))}
          </Column>
        )}
        {tab === "display" && <Display />}
      </Column>
    </BottomSheet>
  );
}

const FilterRow = memo(function FilterRow({
  filter,
  index,
}: {
  filter: FilterKey;
  index: number;
}) {
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
          {STATE_TEXT[state]}
        </Text>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );
});

const SortRow = memo(function SortRow({
  by,
  index,
}: {
  by: SortKey;
  index: number;
}) {
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

/** Columns and title position, as two connected button groups. */
function Display() {
  const { current } = useBreakpoint();
  const m3 = useThemeM3Colors();
  const caption = (text: string) => (
    <Text
      style={{ typography: "bodySmall", fontWeight: "500" }}
      color={m3.onSurfaceVariant}
    >
      {text}
    </Text>
  );
  const columns = columnsFor(current, useValue(settings$.mangaList.density));
  const title = useValue(settings$.mangaList.title);
  const options = columnOptions(current);

  return (
    <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
      {caption("Columns")}
      <ButtonGroup
        options={options.map((option) => String(option.columns))}
        selected={[options.findIndex((option) => option.columns === columns)]}
        onChange={(index) =>
          settings$.mangaList.density.set(options[index].density)
        }
        modifiers={[fillMaxWidth()]}
      />
      {caption("Title")}
      <ButtonGroup
        options={TITLES.map(([, label]) => label)}
        selected={[TITLES.findIndex(([value]) => value === title)]}
        onChange={(index) => settings$.mangaList.title.set(TITLES[index][0])}
        modifiers={[fillMaxWidth()]}
      />
    </Column>
  );
}
