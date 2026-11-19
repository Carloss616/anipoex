import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Toolbar } from "@/components/layout/toolbar";
import { Icons } from "@/components/ui/icon";
import {
  ACTIVITY_FILTERS,
  type ActivityCounts,
  type ActivityFilter,
  FILTER_TITLES,
} from "@/features/activity/utils/filters";
import { useThemeColor } from "@/hooks/use-theme-color";
import { stopAll } from "../../utils/actions";
import { hasScans } from "../../utils/state";

export interface ActivityToolbarProps {
  counts: ActivityCounts;
  filter: ActivityFilter;
  onFilterChange: (filter: ActivityFilter) => void;
}

/** Web: below `md` the filter is a menu here; from `md` a sidebar has it. */
export function ActivityToolbar({
  filter,
  onFilterChange,
}: ActivityToolbarProps) {
  const wide = useBreakpoint().isAtLeast("md");
  const primary = useThemeColor("primary");
  const scanning = useValue(hasScans);

  return (
    <Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          hidden={wide}
          icon={Icons.filter}
          tintColor={filter !== "all" ? primary : undefined}
          accessibilityLabel="Filter"
        >
          {ACTIVITY_FILTERS.map((f) => (
            <Stack.Toolbar.MenuAction
              key={f}
              isOn={f === filter}
              onPress={() => onFilterChange(f)}
            >
              {FILTER_TITLES[f]}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Button
          hidden={!scanning}
          icon={Icons.stop}
          onPress={stopAll}
          accessibilityLabel="Stop all"
        />
      </Stack.Toolbar>
    </Toolbar>
  );
}
