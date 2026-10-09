import FilterListIcon from "@expo/material-symbols/filter_list.xml";
import TranslateIcon from "@expo/material-symbols/translate.xml";
import { Stack } from "expo-router";
import { Toolbar } from "@/components/layout/toolbar";
import { EXTENSION_FILTERS, FILTER_TITLES } from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ListToolbarProps } from "./list-toolbar";

/** Android: language and filter as menus, tinted while set. */
export function ListToolbar({
  filter,
  onFilterChange,
  language,
  languages,
  onLanguageChange,
}: ListToolbarProps) {
  const m3 = useThemeM3Colors();

  return (
    <Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={TranslateIcon}
          tintColor={language ? m3.primary : undefined}
          accessibilityLabel="Language"
        >
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
        <Stack.Toolbar.Menu
          icon={FilterListIcon}
          tintColor={filter !== "all" ? m3.primary : undefined}
          accessibilityLabel="Filter"
        >
          {EXTENSION_FILTERS.map((f) => (
            <Stack.Toolbar.MenuAction
              key={f}
              isOn={f === filter}
              onPress={() => onFilterChange(f)}
            >
              {FILTER_TITLES[f]}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
    </Toolbar>
  );
}
