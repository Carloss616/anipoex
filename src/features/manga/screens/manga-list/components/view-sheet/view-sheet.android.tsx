import { Column } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";
import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { ButtonGroup } from "@/components/native/jetpack-compose/button-group";
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

const open$ = observable(false);

/** Opens the one `ViewSheet` the screen renders. */
export const openViewSheet = () => open$.set(true);

/**
 * Android: columns and title position, as two connected button groups. Rendered
 * once by the screen, outside the grid: mounted inside the grid's header, the
 * sheet's node resized the header and the rows jumped as it opened.
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
  const options = columnOptions(current);

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Column
        verticalArrangement={{ spacedBy: 12 }}
        modifiers={[fillMaxWidth(), padding(24, 0, 24, 32)]}
      >
        <Text style={{ typography: "titleLarge" }}>View</Text>
        {caption("Columns")}
        <ButtonGroup
          options={options.map((option) => String(option.columns))}
          selected={[options.findIndex((option) => option.columns === columns)]}
          onChange={(index) => listView$.density.set(options[index].density)}
          modifiers={[fillMaxWidth()]}
        />
        {caption("Title")}
        <ButtonGroup
          options={TITLES.map(([, label]) => label)}
          selected={[TITLES.findIndex(([value]) => value === title)]}
          onChange={(index) => listView$.title.set(TITLES[index][0])}
          modifiers={[fillMaxWidth()]}
        />
      </Column>
    </BottomSheet>
  );
}
