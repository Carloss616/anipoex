import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import type { ReactNode } from "react";
import { ButtonGroup } from "@/components/native/jetpack-compose/button-group";
import { SEGMENTED_GAP } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SORT_KEYS } from "@/features/manga/utils/list-options";
import { SHOWN_FILTERS, TABS } from "./constants";
import { Display } from "./display";
import { FilterRow } from "./filter-row";
import { SortRow } from "./sort-row";
import { open$, tab$ } from "./utils/sheet-state";

export { openOptionsSheet } from "./utils/sheet-state";

/** Android: outside the grid; in its header the sheet made the rows jump. */
export function OptionsSheet() {
  const isPresented = useValue(open$);
  const tab = useValue(tab$);

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Column modifiers={[fillMaxWidth()]}>
        <Column
          verticalArrangement={{ spacedBy: 12 }}
          modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}
        >
          <Text style={{ typography: "titleLarge" }}>Options</Text>
          <ButtonGroup
            options={TABS.map(([, label]) => label)}
            selected={[TABS.findIndex(([value]) => value === tab)]}
            onChange={(index) => tab$.set(TABS[index][0])}
            modifiers={[fillMaxWidth()]}
          />
        </Column>
        {tab === "filter" && (
          <TabContent>
            {SHOWN_FILTERS.map((key, index) => (
              <FilterRow key={key} filter={key} index={index} />
            ))}
          </TabContent>
        )}
        {tab === "sort" && (
          <TabContent>
            {SORT_KEYS.map((key, index) => (
              <SortRow key={key} by={key} index={index} />
            ))}
          </TabContent>
        )}
        {tab === "display" && (
          <TabContent>
            <Display />
          </TabContent>
        )}
      </Column>
    </BottomSheet>
  );
}

/** Scrolls under the fixed tabs; a Column bounds it by the height left. */
function TabContent({ children }: { children: ReactNode }) {
  return (
    <Column
      verticalArrangement={{ spacedBy: SEGMENTED_GAP }}
      // Padding after the scroll, so the bottom gap scrolls with the rows.
      modifiers={[fillMaxWidth(), verticalScroll(), padding(16, 0, 16, 16)]}
    >
      {children}
    </Column>
  );
}
