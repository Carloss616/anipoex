import { Stack } from "expo-router";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Toolbar } from "@/components/layout/toolbar";
import { Icon } from "@/components/ui/icon";
import {
  checkForUpdates,
  EXTENSION_FILTERS,
  FILTER_TITLES,
} from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ListContentProps } from "../list-content";

export type ListToolbarProps = Pick<
  ListContentProps,
  | "counts"
  | "filter"
  | "onFilterChange"
  | "language"
  | "languages"
  | "onLanguageChange"
>;

/**
 * Web: below `md` the language and the filter fold in here as menus; from `md`
 * the dropdown and the sidebar take them. Always a check for updates.
 */
export function ListToolbar({
  filter,
  onFilterChange,
  language,
  languages,
  onLanguageChange,
}: ListToolbarProps) {
  const wide = useBreakpoint().isAtLeast("md");
  const primary = useThemeColor("primary");
  const [checking, setChecking] = useState(false);

  return (
    <Toolbar spinning={checking}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          hidden={wide}
          icon={Icon.select({
            ios: "globe",
            android: require("@expo/material-symbols/translate.xml"),
            web: "languages",
          })}
          tintColor={language ? primary : undefined}
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
          hidden={wide}
          icon={Icon.select({
            ios: "line.3.horizontal.decrease",
            android: require("@expo/material-symbols/filter_list.xml"),
            web: "list-filter",
          })}
          tintColor={filter !== "all" ? primary : undefined}
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
        <Stack.Toolbar.Button
          icon={Icon.select({
            ios: "arrow.clockwise",
            android: require("@expo/material-symbols/refresh.xml"),
            web: "refresh-cw",
          })}
          onPress={() => {
            setChecking(true);
            void checkForUpdates().finally(() => setChecking(false));
          }}
          disabled={checking}
          accessibilityLabel="Check for updates"
        />
      </Stack.Toolbar>
    </Toolbar>
  );
}
