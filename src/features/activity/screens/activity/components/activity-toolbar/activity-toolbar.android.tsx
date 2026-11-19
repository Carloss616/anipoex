import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Toolbar } from "@/components/layout/toolbar";
import { Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { stopAll } from "../../utils/actions";
import { ACTIVITY_FILTERS, FILTER_TITLES } from "../../utils/filters";
import { hasScans } from "../../utils/state";
import type { ActivityToolbarProps } from "./activity-toolbar";

/** The filter menu, tinted while set, and Stop all while scans run. */
export function ActivityToolbar({
  filter,
  onFilterChange,
}: ActivityToolbarProps) {
  const m3 = useThemeM3Colors();
  const scanning = useValue(hasScans);

  return (
    <Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={Icons.filter}
          tintColor={filter !== "all" ? m3.primary : undefined}
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
          tintColor={m3.error}
          onPress={stopAll}
          accessibilityLabel="Stop all"
        />
      </Stack.Toolbar>
    </Toolbar>
  );
}
