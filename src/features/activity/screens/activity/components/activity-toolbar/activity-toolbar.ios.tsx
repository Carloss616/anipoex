import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import type { SFSymbol } from "expo-symbols";
import { Icons } from "@/components/ui/icon";
import {
  ACTIVITY_FILTERS,
  type ActivityFilter,
  FILTER_TITLES,
} from "@/features/activity/utils/filters";
import { useThemeColor } from "@/hooks/use-theme-color";
import { stopAll } from "../../utils/actions";
import { hasScans } from "../../utils/state";
import type { ActivityToolbarProps } from "./activity-toolbar";

const FILTER_SYMBOLS: Record<ActivityFilter, SFSymbol> = {
  all: "tray.full",
  scans: "arrow.triangle.2.circlepath",
  downloads: "arrow.down.circle",
  send: "icloud.and.arrow.up",
  sync: "arrow.triangle.2.circlepath.icloud",
};

/**
 * The filter menu and, while scans run, Stop all. The menus sit inline:
 * `Stack.Toolbar` only reads its direct children.
 */
export function ActivityToolbar({
  counts,
  filter,
  onFilterChange,
}: ActivityToolbarProps) {
  const primary = useThemeColor("primary");
  const destructive = useThemeColor("destructive");
  const scanning = useValue(hasScans);

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu
        icon={Icons.filter}
        tintColor={filter !== "all" ? primary : undefined}
        accessibilityLabel="Filter"
      >
        <Stack.Toolbar.Menu inline title="Filter">
          {ACTIVITY_FILTERS.map((f) => (
            <Stack.Toolbar.MenuAction
              key={f}
              icon={FILTER_SYMBOLS[f]}
              isOn={f === filter}
              subtitle={String(counts[f])}
              onPress={() => onFilterChange(f)}
            >
              {FILTER_TITLES[f]}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar.Menu>
      <Stack.Toolbar.Button
        hidden={!scanning}
        icon={Icons.stop}
        tintColor={destructive}
        onPress={stopAll}
        accessibilityLabel="Stop all"
      />
    </Stack.Toolbar>
  );
}
