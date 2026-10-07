import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { ButtonGroup } from "panelui-native/components/button-group";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Column } from "@/components/layout/column";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
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

/** Web: columns and title position, as two segmented rows — the Android sheet's layout. */
export function ViewSheet() {
  const isPresented = useValue(open$);
  const { current } = useBreakpoint();
  const columns = columnsFor(current, useValue(listView$.density));
  const title = toTitlePosition(useValue(listView$.title));

  return (
    <BottomSheet isPresented={isPresented} onDismiss={() => open$.set(false)}>
      <Column className="w-full gap-3 px-6 pt-6 pb-8">
        <Typography type="h4">View</Typography>
        <Typography type="small" muted>
          Columns
        </Typography>
        <ButtonGroup fullWidth size="sm">
          {columnOptions(current).map((option) => {
            const selected = option.columns === columns;
            return (
              <Button
                key={option.density}
                variant={selected ? "secondary" : "outline"}
                aria-selected={selected}
                onPress={() => listView$.density.set(option.density)}
              >
                {String(option.columns)}
              </Button>
            );
          })}
        </ButtonGroup>
        <Typography type="small" muted>
          Title
        </Typography>
        <ButtonGroup fullWidth size="sm">
          {TITLES.map(([value, label]) => {
            const selected = title === value;
            return (
              <Button
                key={value}
                variant={selected ? "secondary" : "outline"}
                aria-selected={selected}
                onPress={() => listView$.title.set(value)}
              >
                {label}
              </Button>
            );
          })}
        </ButtonGroup>
      </Column>
    </BottomSheet>
  );
}
