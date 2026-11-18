import { useValue } from "@legendapp/state/react";
import { Frame } from "panelui-web/frame";
import { RadioGroup } from "panelui-web/radio-group";
import { Sheet } from "panelui-web/sheet";
import { Tabs } from "panelui-web/tabs";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { chooseSort, listOptions$ } from "@/features/manga/state/list-options";
import { SORT_KEYS, type SortKey } from "@/features/manga/utils/list-options";
import { SHOWN_FILTERS, TABS } from "./constants";
import { Display } from "./display";
import { FilterRow } from "./filter-row";
import { SortRow } from "./sort-row";
import { type OptionsTab, open$, tab$ } from "./utils/sheet-state";

export { openOptionsSheet } from "./utils/sheet-state";

/** Web: Filter, Sort and Display as tabs over the sheet's body. */
export function OptionsSheet() {
  const isPresented = useValue(open$);
  const tab = useValue(tab$);

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Sheet.Header title="Options" className="p-4" />
      <Tabs
        value={tab}
        onValueChange={(value) => tab$.set(value as OptionsTab)}
        className="flex-1 gap-0"
      >
        <Tabs.List aria-label="Options" className="mx-4 mb-4 w-auto">
          {TABS.map(([value, label]) => (
            <Tabs.Trigger key={value} value={value} className="flex-1">
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Sheet.Body className="px-4 pb-4">
          <Tabs.Content value="filter">
            <Frame variant="plain">
              <Frame.Panel data-attached="column">
                {SHOWN_FILTERS.map((key, index) => (
                  <FilterRow key={key} filter={key} index={index} />
                ))}
              </Frame.Panel>
            </Frame>
          </Tabs.Content>
          <Tabs.Content value="sort">
            <Frame variant="plain">
              <SortGroup />
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

function SortGroup() {
  const by = useValue(listOptions$.sort.by);

  return (
    <RadioGroup
      aria-label="Sort"
      value={by}
      onValueChange={(value) => chooseSort(value as SortKey)}
      render={<Frame.Panel data-attached="column" />}
      className="gap-0"
    >
      {SORT_KEYS.map((key, index) => (
        <SortRow key={key} by={key} index={index} />
      ))}
    </RadioGroup>
  );
}
