import {
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
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
import { useFontFamily } from "@/hooks/use-font";

const TITLES = [
  ["below", "Below cover"],
  ["over", "On cover"],
] as const;

const open$ = observable(false);

/** Opens the one `ViewSheet` the screen renders. */
export const openViewSheet = () => open$.set(true);

/**
 * Android: columns and title position, as two M3 segmented rows. Rendered once
 * by the screen, outside the grid: mounted inside the grid's header, the sheet's
 * node resized the header and the rows jumped as it opened.
 */
export function ViewSheet() {
  const isPresented = useValue(open$);
  const { current } = useBreakpoint();
  const fontFamily = useFontFamily("medium");
  const columns = columnsFor(current, useValue(listView$.density));
  const title = toTitlePosition(useValue(listView$.title));

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Column className="w-full gap-3 px-6 pb-8">
        <Typography type="h4">View</Typography>
        <Typography type="small" muted>
          Columns
        </Typography>
        <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
          {columnOptions(current).map((option) => (
            <SegmentedButton
              key={option.density}
              selected={option.columns === columns}
              onClick={() => listView$.density.set(option.density)}
            >
              <SegmentedButton.Label>
                <Text style={{ fontFamily }}>{String(option.columns)}</Text>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
        <Typography type="small" muted>
          Title
        </Typography>
        <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
          {TITLES.map(([value, label]) => (
            <SegmentedButton
              key={value}
              selected={title === value}
              onClick={() => listView$.title.set(value)}
            >
              <SegmentedButton.Label>
                <Text style={{ fontFamily }}>{label}</Text>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
      </Column>
    </BottomSheet>
  );
}
