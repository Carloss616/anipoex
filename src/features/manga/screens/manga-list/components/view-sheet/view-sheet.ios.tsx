import { Picker, VStack } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  frame,
  padding,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/swift-ui/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { listView$ } from "@/features/manga/state/list-view";
import {
  columnOptions,
  columnsFor,
  toTitlePosition,
} from "@/features/manga/utils/list-view";

const TITLES = [
  ["below", "Below cover"],
  ["over", "On cover"],
] as const;

const SECONDARY = [foregroundStyle("secondary")];

const open$ = observable(false);

/** Opens the one `ViewSheet` the screen renders. */
export const openViewSheet = () => open$.set(true);

/**
 * iOS: columns and title position, as two segmented pickers. The sheet fits its
 * contents, so the grid stays in view and each pick shows as it is made.
 */
export function ViewSheet() {
  const isPresented = useValue(open$);
  const { current } = useBreakpoint();
  const options = columnOptions(current);
  const columns = columnsFor(current, useValue(listView$.density));
  const title = toTitlePosition(useValue(listView$.title));

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <VStack
        alignment="leading"
        spacing={12}
        modifiers={[
          padding({ horizontal: 24, top: 16, bottom: 32 }),
          frame({ maxWidth: Infinity }),
        ]}
      >
        <Text textStyle="title3">View</Text>
        <Text textStyle="footnote" weight="medium" modifiers={SECONDARY}>
          Columns
        </Text>
        <Picker
          selection={columns}
          onSelectionChange={(selected) => {
            const option = options.find((o) => o.columns === selected);
            if (option) listView$.density.set(option.density);
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
          onSelectionChange={(selected) => listView$.title.set(selected)}
          modifiers={[pickerStyle("segmented")]}
        >
          {TITLES.map(([value, label]) => (
            <Text key={value} modifiers={[tag(value)]}>
              {label}
            </Text>
          ))}
        </Picker>
      </VStack>
    </BottomSheet>
  );
}
