import { InputChip, LazyRow } from "@expo/ui/jetpack-compose";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ActiveFiltersProps } from "./active-filters";

/** M3 input chips that clear their filter, then the total; nothing without filters. */
export function ActiveFilters({ filters, total }: ActiveFiltersProps) {
  const m3 = useThemeM3Colors();
  const insets = useSafeAreaInsets();
  if (filters.length === 0) return null;

  return (
    <LazyRow
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}
      contentPadding={{
        start: GUTTER + insets.left,
        end: GUTTER + insets.right,
      }}
    >
      {filters.map((f) => (
        <InputChip
          key={f.label}
          selected
          onClick={f.clear}
          colors={{
            selectedContainerColor: m3.secondaryContainer,
            selectedLabelColor: m3.onSecondaryContainer,
            selectedTrailingIconColor: m3.onSecondaryContainer,
          }}
        >
          <InputChip.Label>
            <Text style={{ typography: "labelLarge" }}>{f.label}</Text>
          </InputChip.Label>
          <InputChip.TrailingIcon>
            <Icon name={Icons.close} size={18} color="inherit" />
          </InputChip.TrailingIcon>
        </InputChip>
      ))}
      {total && (
        <Text style={{ typography: "bodyMedium" }} color={m3.onSurfaceVariant}>
          {total}
        </Text>
      )}
    </LazyRow>
  );
}
