import {
  Column,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";
import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/jetpack-compose/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { listView$ } from "@/features/manga/state/list-view";
import {
  columnOptions,
  columnsFor,
  toTitlePosition,
} from "@/features/manga/utils/list-view";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

const TITLES = [
  ["below", "Below cover"],
  ["over", "On cover"],
] as const;

const LABEL = { typography: "labelLarge" } as const;

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
  const m3 = useThemeM3Colors();
  const caption = (text: string) => (
    <Text
      style={{ typography: "bodySmall", fontWeight: "500" }}
      color={m3.onSurfaceVariant}
    >
      {text}
    </Text>
  );
  const columns = columnsFor(current, useValue(listView$.density));
  const title = toTitlePosition(useValue(listView$.title));

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Column
        verticalArrangement={{ spacedBy: 12 }}
        modifiers={[fillMaxWidth(), padding(24, 0, 24, 32)]}
      >
        <Text style={{ typography: "titleLarge" }}>View</Text>
        {caption("Columns")}
        <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
          {columnOptions(current).map((option) => (
            <SegmentedButton
              key={option.density}
              selected={option.columns === columns}
              onClick={() => listView$.density.set(option.density)}
            >
              <SegmentedButton.Label>
                <Text style={LABEL}>{String(option.columns)}</Text>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
        {caption("Title")}
        <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
          {TITLES.map(([value, label]) => (
            <SegmentedButton
              key={value}
              selected={title === value}
              onClick={() => listView$.title.set(value)}
            >
              <SegmentedButton.Label>
                <Text style={LABEL}>{label}</Text>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
      </Column>
    </BottomSheet>
  );
}
