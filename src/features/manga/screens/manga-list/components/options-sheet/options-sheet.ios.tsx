import { List, Picker, Section, VStack } from "@expo/ui/swift-ui";
import {
  frame,
  listRowBackground,
  listStyle,
  padding,
  pickerStyle,
  scrollContentBackground,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import type { ReactNode } from "react";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SORT_KEYS } from "@/features/manga/utils/list-options";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SHOWN_FILTERS, TABS } from "./constants";
import { Display } from "./display";
import { FilterRow } from "./filter-row";
import { SortRow } from "./sort-row";
import { type OptionsTab, open$, tab$ } from "./utils/sheet-state";

export { openOptionsSheet } from "./utils/sheet-state";

const SHEET_HEIGHT = 520;

/** iOS: a fixed-height sheet, as a `List` has no height of its own to fit. */
export function OptionsSheet() {
  const isPresented = useValue(open$);
  const tab = useValue(tab$);

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={() => open$.set(false)}
      // The six sorts at default text size; larger text scrolls them.
      snapPoints={[{ height: SHEET_HEIGHT }, "full"]}
    >
      <VStack
        alignment="leading"
        spacing={12}
        modifiers={[padding({ all: 16 }), frame({ maxWidth: Infinity })]}
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
      </VStack>
      {tab === "filter" && (
        <Rows>
          {SHOWN_FILTERS.map((key, index) => (
            <FilterRow key={key} filter={key} index={index} />
          ))}
        </Rows>
      )}
      {tab === "sort" && (
        <Rows>
          {SORT_KEYS.map((key, index) => (
            <SortRow key={key} by={key} index={index} />
          ))}
        </Rows>
      )}
      {tab === "display" && <Display />}
    </BottomSheet>
  );
}

function Rows({ children }: { children: ReactNode }) {
  const cell = useThemeColor("muted");

  return (
    <List
      modifiers={[
        listStyle("insetGrouped"),
        scrollContentBackground("hidden"),
        useFont(),
      ]}
    >
      <Section modifiers={[listRowBackground(cell)]}>{children}</Section>
    </List>
  );
}
