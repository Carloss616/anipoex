import { Picker } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Column } from "@/components/layout/column";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Typography } from "@/components/ui/typography";
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
      <Column className="w-full gap-3 px-6 pt-4 pb-8">
        <Typography type="h4">View</Typography>
        <Typography type="small" muted>
          Columns
        </Typography>
        <Picker
          selection={columns}
          onSelectionChange={(selected) => {
            const option = options.find((o) => o.columns === selected);
            if (option) listView$.density.set(option.density);
          }}
          modifiers={[pickerStyle("segmented")]}
        >
          {options.map((option) => (
            <Typography key={option.density} modifiers={[tag(option.columns)]}>
              {String(option.columns)}
            </Typography>
          ))}
        </Picker>
        <Typography type="small" muted>
          Title
        </Typography>
        <Picker
          selection={title}
          onSelectionChange={(selected) => listView$.title.set(selected)}
          modifiers={[pickerStyle("segmented")]}
        >
          {TITLES.map(([value, label]) => (
            <Typography key={value} modifiers={[tag(value)]}>
              {label}
            </Typography>
          ))}
        </Picker>
      </Column>
    </BottomSheet>
  );
}
