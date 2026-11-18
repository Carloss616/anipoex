import { Picker, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  frame,
  padding,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/swift-ui/text";
import { columnOptions, columnsFor } from "@/features/manga/utils/list-view";
import { settings$ } from "@/state/settings";
import { TITLES } from "../constants";

const SECONDARY = [foregroundStyle("secondary")];

/** Columns and title position, as two segmented pickers. */
export function Display() {
  const { current } = useBreakpoint();
  const options = columnOptions(current);
  const columns = columnsFor(current, useValue(settings$.mangaList.density));
  const title = useValue(settings$.mangaList.title);

  return (
    <ScrollView>
      <VStack
        alignment="leading"
        spacing={12}
        modifiers={[
          padding({ horizontal: 16, bottom: 16 }),
          frame({ maxWidth: Infinity }),
        ]}
      >
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
    </ScrollView>
  );
}
