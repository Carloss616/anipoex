import { FilterChip, InputChip, LazyRow } from "@expo/ui/jetpack-compose";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { FORMAT_OPTIONS } from "./constants";
import type { SearchFiltersProps } from "./search-filters";
import { sortLabel, sortMenuItems } from "./utils";

/**
 * M3 filter chips for the formats and the sort menu, an input chip for the
 * genre. Renders in a `Host`.
 */
export function SearchFilters({ params, onChange }: SearchFiltersProps) {
  const m3 = useThemeM3Colors();
  const insets = useSafeAreaInsets();

  return (
    <LazyRow
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}
      contentPadding={{
        start: GUTTER + insets.left,
        end: GUTTER + insets.right,
      }}
    >
      {FORMAT_OPTIONS.map(({ value, label }) => {
        const selected = params.format === value;
        return (
          <FilterChip
            key={label}
            selected={selected}
            onClick={() => onChange({ ...params, format: value })}
          >
            {selected && (
              <FilterChip.LeadingIcon>
                <Icon name={Icons.check} size={18} color="inherit" />
              </FilterChip.LeadingIcon>
            )}
            <FilterChip.Label>
              <Text style={{ typography: "labelLarge" }}>{label}</Text>
            </FilterChip.Label>
          </FilterChip>
        );
      })}
      <Menu items={sortMenuItems(params, onChange)}>
        <SortChip label={sortLabel(params)} />
      </Menu>
      {params.genre && (
        <InputChip
          selected
          onClick={() => onChange({ ...params, genre: undefined })}
          colors={{
            selectedContainerColor: m3.secondaryContainer,
            selectedLabelColor: m3.onSecondaryContainer,
            selectedTrailingIconColor: m3.onSecondaryContainer,
          }}
        >
          <InputChip.Label>
            <Text style={{ typography: "labelLarge" }}>{params.genre}</Text>
          </InputChip.Label>
          <InputChip.TrailingIcon>
            <Icon name={Icons.close} size={18} color="inherit" />
          </InputChip.TrailingIcon>
        </InputChip>
      )}
    </LazyRow>
  );
}

// The menu hands its opener in as `onPress`.
function SortChip({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <FilterChip selected={false} onClick={onPress}>
      <FilterChip.Label>
        <Text style={{ typography: "labelLarge" }}>{label}</Text>
      </FilterChip.Label>
      <FilterChip.TrailingIcon>
        <Icon name={Icons.chevronDown} size={18} color="inherit" />
      </FilterChip.TrailingIcon>
    </FilterChip>
  );
}
