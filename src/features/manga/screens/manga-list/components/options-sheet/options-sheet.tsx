import { useValue } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Frame } from "panelui-web/frame";
import { Sheet } from "panelui-web/sheet";
import { Tabs } from "panelui-web/tabs";
import { memo } from "react";
import { View } from "react-native";
import { BottomSheet, SHEET_INSET } from "@/components/ui/bottom-sheet";
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
} from "@/features/manga/utils/list-options";
import { columnOptions, columnsFor } from "@/features/manga/utils/list-view";
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

/** Web: Filter, Sort and Display as tabs over the sheet's body. */
export function OptionsSheet() {
  const isPresented = useValue(open$);
  const tab = useValue(tab$);

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Sheet.Header title="Options" className={SHEET_INSET.header} />
      <Tabs
        value={tab}
        onValueChange={(value) => tab$.set(value as OptionsTab)}
        className="flex-1 gap-0"
      >
        <Tabs.List aria-label="Options" className="mx-4 mt-4 w-auto">
          {TABS.map(([value, label]) => (
            <Tabs.Trigger key={value} value={value} className="flex-1">
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Sheet.Body className={cn(SHEET_INSET.body, "pb-8")}>
          <Tabs.Content value="filter">
            <Frame variant="plain">
              <Frame.Panel data-attached="column">
                {SHOWN_FILTERS.map((key) => (
                  <FilterRow key={key} filter={key} />
                ))}
              </Frame.Panel>
            </Frame>
          </Tabs.Content>
          <Tabs.Content value="sort">
            <Frame variant="plain">
              <Frame.Panel data-attached="column">
                {SORT_KEYS.map((key) => (
                  <SortRow key={key} by={key} />
                ))}
              </Frame.Panel>
            </Frame>
          </Tabs.Content>
          <Tabs.Content value="display">
            <Display />
          </Tabs.Content>
        </Sheet.Body>
      </Tabs>
    </BottomSheet>
  );
}

const FilterRow = memo(function FilterRow({ filter }: { filter: FilterKey }) {
  const state = useValue(() => listOptions$.filters[filter].get());

  return (
    <Frame.Row
      aria-label={filterA11y(filter, state)}
      onClick={() => cycleFilter(filter)}
    >
      <Frame.Media>
        <View
          className={cn(
            "border-muted-foreground size-4 items-center justify-center rounded-sm border-[1.5px]",
            state === "include" && "border-primary bg-primary",
            state === "exclude" && "border-destructive bg-destructive",
          )}
        >
          {state !== "any" && (
            <Icon
              name={state === "include" ? Icons.check : Icons.close}
              size={12}
              className="text-primary-foreground"
            />
          )}
        </View>
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{FILTER_LABELS[filter]}</Frame.Title>
      </Frame.Content>
      {state !== "any" && (
        <Frame.Actions>
          <Typography type="small" muted>
            {state === "include" ? "Only" : "Excluded"}
          </Typography>
        </Frame.Actions>
      )}
    </Frame.Row>
  );
});

const SortRow = memo(function SortRow({ by }: { by: SortKey }) {
  const label = useValue(() => sortA11y(by, listOptions$.sort.get()));
  const ascending = useValue(() => {
    const sort = listOptions$.sort.get();
    return sort.by === by ? sort.ascending : undefined;
  });

  return (
    <Frame.Row aria-label={label} onClick={() => chooseSort(by)}>
      <Frame.Content>
        <Frame.Title as="p">{SORT_LABELS[by]}</Frame.Title>
      </Frame.Content>
      {ascending !== undefined && (
        <Frame.Actions>
          <Icon
            name={ascending ? Icons.moveUp : Icons.moveDown}
            className="text-primary"
          />
        </Frame.Actions>
      )}
    </Frame.Row>
  );
});

/** Columns and title position, as two segmented rows, like Android's. */
function Display() {
  const { current } = useBreakpoint();
  const columns = columnsFor(current, useValue(settings$.mangaList.density));
  const title = useValue(settings$.mangaList.title);

  return (
    <View className="gap-3">
      <Typography type="small" muted>
        Columns
      </Typography>
      <ButtonGroup aria-label="Columns" className="w-full">
        {columnOptions(current).map((option) => {
          const selected = option.columns === columns;
          return (
            <Button
              key={option.density}
              size="sm"
              variant={selected ? "secondary" : "outline"}
              aria-pressed={selected}
              onClick={() => settings$.mangaList.density.set(option.density)}
              className="flex-1"
            >
              {option.columns}
            </Button>
          );
        })}
      </ButtonGroup>
      <Typography type="small" muted>
        Title
      </Typography>
      <ButtonGroup aria-label="Title" className="w-full">
        {TITLES.map(([value, label]) => {
          const selected = title === value;
          return (
            <Button
              key={value}
              size="sm"
              variant={selected ? "secondary" : "outline"}
              aria-pressed={selected}
              onClick={() => settings$.mangaList.title.set(value)}
              className="flex-1"
            >
              {label}
            </Button>
          );
        })}
      </ButtonGroup>
    </View>
  );
}
