import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Sheet } from "panelui-web/sheet";
import { BottomSheet, SHEET_INSET } from "@/components/ui/bottom-sheet";
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
      <Sheet.Header title="View" className={SHEET_INSET.header} />
      <Sheet.Body className={cn(SHEET_INSET.body, "flex flex-col gap-3 pb-8")}>
        <Typography type="small" muted>
          Columns
        </Typography>
        <ButtonGroup aria-label="Columns" className="w-full">
          {columnOptions(current).map((option) => {
            const selected = option.columns === columns;
            return (
              <Button
                key={option.density}
                size="sm"
                variant={selected ? "secondary" : "outline"}
                aria-pressed={selected}
                onClick={() => listView$.density.set(option.density)}
                className="flex-1"
              >
                {option.columns}
              </Button>
            );
          })}
        </ButtonGroup>
        <Typography type="small" muted>
          Title
        </Typography>
        <ButtonGroup aria-label="Title" className="w-full">
          {TITLES.map(([value, label]) => {
            const selected = title === value;
            return (
              <Button
                key={value}
                size="sm"
                variant={selected ? "secondary" : "outline"}
                aria-pressed={selected}
                onClick={() => listView$.title.set(value)}
                className="flex-1"
              >
                {label}
              </Button>
            );
          })}
        </ButtonGroup>
      </Sheet.Body>
    </BottomSheet>
  );
}
