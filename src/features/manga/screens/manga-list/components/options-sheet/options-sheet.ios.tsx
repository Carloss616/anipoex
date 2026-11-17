import {
  Button,
  Divider,
  HStack,
  Picker,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  background,
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  padding,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import type { SFSymbol } from "expo-symbols";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { memo, type ReactNode } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
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
import { useThemeColor } from "@/hooks/use-theme-color";
import { settings$ } from "@/state/settings";
import { FILTER_LABELS, SHOWN_FILTERS, SORT_LABELS, TABS } from "./constants";
import { filterA11y, sortA11y } from "./utils/labels";
import { type OptionsTab, open$, tab$ } from "./utils/sheet-state";

export { openOptionsSheet } from "./utils/sheet-state";

const TITLES = [
  ["below", "Below"],
  ["split", "Split"],
  ["over", "Over"],
] as const;

const STATE_SYMBOLS: Record<TriState, SFSymbol> = {
  any: "circle",
  include: "checkmark.circle.fill",
  exclude: "xmark.circle.fill",
};

const SECONDARY = [foregroundStyle("secondary")];
const ROW = [padding({ horizontal: 16, vertical: 12 }), ...ROW_FILL];

/**
 * iOS: Filter, Sort and Display behind a segmented picker. The sheet fits its
 * contents, so the grid stays in view and each pick shows as it is made.
 */
export function OptionsSheet() {
  const isPresented = useValue(open$);
  const tab = useValue(tab$);

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={() => open$.set(false)}
      contentKey={tab}
    >
      <VStack
        alignment="leading"
        spacing={12}
        modifiers={[
          padding({ horizontal: 24, top: 16, bottom: 32 }),
          frame({ maxWidth: Infinity }),
        ]}
      >
        <Text textStyle="title3">Options</Text>
        <Picker
          selection={tab}
          onSelectionChange={(selected) => tab$.set(selected as OptionsTab)}
          modifiers={[pickerStyle("segmented")]}
        >
          {TABS.map(([value, label]) => (
            <Text key={value} modifiers={[tag(value)]}>
              {label}
            </Text>
          ))}
        </Picker>
        {tab === "filter" && (
          <Section
            keys={SHOWN_FILTERS}
            row={(key) => <FilterRow filter={key} />}
          />
        )}
        {tab === "sort" && (
          <Section keys={SORT_KEYS} row={(key) => <SortRow by={key} />} />
        )}
        {tab === "display" && <Display />}
      </VStack>
    </BottomSheet>
  );
}

/** An inset-grouped card: a `List` would scroll instead of fitting the sheet. */
function Section<K extends string>({
  keys,
  row,
}: {
  keys: readonly K[];
  row: (key: K) => ReactNode;
}) {
  const cell = useThemeColor("muted");

  return (
    <VStack
      spacing={0}
      modifiers={[background(cell), clipShape("roundedRectangle", 22)]}
    >
      {keys.map((key, i) => (
        <VStack key={key} spacing={0}>
          {i > 0 && <Divider modifiers={[padding({ leading: 16 })]} />}
          {row(key)}
        </VStack>
      ))}
    </VStack>
  );
}

const FilterRow = memo(function FilterRow({ filter }: { filter: FilterKey }) {
  const state = useValue(() => listOptions$.filters[filter].get());
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);

  return (
    <Button
      onPress={() => cycleFilter(filter)}
      modifiers={[
        buttonStyle("plain"),
        accessibilityLabel(filterA11y(filter, state)),
      ]}
    >
      <HStack spacing={12} modifiers={ROW}>
        <Icon
          name={STATE_SYMBOLS[state]}
          muted={state === "any"}
          color={
            state === "include"
              ? primary
              : state === "exclude"
                ? destructive
                : undefined
          }
        />
        <Text>{FILTER_LABELS[filter]}</Text>
        <Spacer />
        {state !== "any" && (
          <Text modifiers={SECONDARY}>
            {state === "include" ? "Only" : "Excluded"}
          </Text>
        )}
      </HStack>
    </Button>
  );
});

const SortRow = memo(function SortRow({ by }: { by: SortKey }) {
  const label = useValue(() => sortA11y(by, listOptions$.sort.get()));
  const ascending = useValue(() => {
    const sort = listOptions$.sort.get();
    return sort.by === by ? sort.ascending : undefined;
  });
  const primary = useThemeColor("primary");
  const active = ascending !== undefined;

  return (
    <Button
      onPress={() => chooseSort(by)}
      modifiers={[buttonStyle("plain"), accessibilityLabel(label)]}
    >
      <HStack spacing={12} modifiers={ROW}>
        <Text modifiers={active ? [foregroundStyle(primary)] : []}>
          {SORT_LABELS[by]}
        </Text>
        <Spacer />
        {active && (
          <Icon
            name={ascending ? Icons.moveUp : Icons.moveDown}
            color={primary}
          />
        )}
      </HStack>
    </Button>
  );
});

/** Columns and title position, as two segmented pickers. */
function Display() {
  const { current } = useBreakpoint();
  const options = columnOptions(current);
  const columns = columnsFor(current, useValue(settings$.mangaList.density));
  const title = useValue(settings$.mangaList.title);

  return (
    <VStack alignment="leading" spacing={12}>
      <Text textStyle="footnote" weight="medium" modifiers={SECONDARY}>
        Columns
      </Text>
      <Picker
        selection={columns}
        onSelectionChange={(selected) => {
          const option = options.find((o) => o.columns === selected);
          if (option) settings$.mangaList.density.set(option.density);
        }}
        modifiers={[pickerStyle("segmented")]}
      >
        {options.map((option) => (
          <Text key={option.density} modifiers={[tag(option.columns)]}>
            {String(option.columns)}
          </Text>
        ))}
      </Picker>
      <Text textStyle="footnote" weight="medium" modifiers={SECONDARY}>
        Title
      </Text>
      <Picker
        selection={title}
        onSelectionChange={(selected) =>
          settings$.mangaList.title.set(selected)
        }
        modifiers={[pickerStyle("segmented")]}
      >
        {TITLES.map(([value, label]) => (
          <Text key={value} modifiers={[tag(value)]}>
            {label}
          </Text>
        ))}
      </Picker>
    </VStack>
  );
}
