import { Stack } from "expo-router";
import type { SFSymbol } from "expo-symbols";
import {
  EXTENSION_FILTERS,
  type ExtensionFilter,
  extensionCount,
  FILTER_TITLES,
} from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ListToolbarProps } from "./list-toolbar";

const FILTER_SYMBOLS: Record<ExtensionFilter, SFSymbol> = {
  all: "puzzlepiece.extension",
  installed: "checkmark.circle",
  available: "arrow.down.circle",
  updates: "arrow.clockwise",
};

/**
 * Like the iOS manga list: one menu picks the filter and, in a submenu, the
 * language. The menus sit inline: `Stack.Toolbar` only reads its direct
 * children, so a wrapper component would be dropped.
 */
export function ListToolbar({
  counts,
  filter,
  onFilterChange,
  language,
  languages,
  onLanguageChange,
}: ListToolbarProps) {
  const primary = useThemeColor("primary");

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu
        icon="line.3.horizontal.decrease"
        tintColor={filter !== "all" || language ? primary : undefined}
        accessibilityLabel="Filter and language"
      >
        <Stack.Toolbar.Menu inline title="Filter">
          {EXTENSION_FILTERS.map((f) => (
            <Stack.Toolbar.MenuAction
              key={f}
              icon={FILTER_SYMBOLS[f]}
              isOn={f === filter}
              subtitle={extensionCount(counts[f])}
              onPress={() => onFilterChange(f)}
            >
              {FILTER_TITLES[f]}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Menu title="Language" icon="globe">
          {[undefined, ...languages].map((l) => (
            <Stack.Toolbar.MenuAction
              key={l?.code ?? "all"}
              isOn={l?.code === language}
              onPress={() => onLanguageChange(l?.code)}
            >
              {l?.name ?? "All languages"}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
