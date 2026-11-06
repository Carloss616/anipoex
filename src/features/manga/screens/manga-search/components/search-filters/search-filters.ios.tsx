import { Stack } from "expo-router";
import { Icons } from "@/components/ui/icon";
import { sortOf } from "@/features/manga/utils/search-params";
import { useThemeColor } from "@/hooks/use-theme-color";
import { FORMAT_OPTIONS, SORT_OPTIONS } from "./constants";
import type { SearchFiltersProps } from "./search-filters";

/**
 * One toolbar menu, as the manga list's. Its sections sit inline:
 * `Stack.Toolbar` only reads its direct children.
 */
export function SearchFilters({ params, onChange }: SearchFiltersProps) {
  const primary = useThemeColor("primary");
  const sort = sortOf(params);

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu
        icon={Icons.filter}
        tintColor={params.format || params.genre ? primary : undefined}
        accessibilityLabel="Format, sort and genre"
      >
        <Stack.Toolbar.Menu inline title="Format">
          {FORMAT_OPTIONS.map(({ value, label }) => (
            <Stack.Toolbar.MenuAction
              key={label}
              isOn={params.format === value}
              onPress={() => onChange({ ...params, format: value })}
            >
              {label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Menu inline title="Sort">
          {SORT_OPTIONS.map(({ value, label }) => (
            <Stack.Toolbar.MenuAction
              key={value}
              isOn={sort === value}
              onPress={() => onChange({ ...params, sort: value })}
            >
              {label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        {params.genre && (
          // A genre comes from Home: unchecking it is the way to drop it.
          <Stack.Toolbar.Menu inline title="Genre">
            <Stack.Toolbar.MenuAction
              isOn
              onPress={() => onChange({ ...params, genre: undefined })}
            >
              {params.genre}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        )}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
