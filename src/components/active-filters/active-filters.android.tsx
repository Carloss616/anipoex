import { InputChip } from "@expo/ui/jetpack-compose";
import { LazyRow } from "@/components/layout/lazy-row";
import { Icon, Icons } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ActiveFiltersProps } from "./active-filters";

/** M3 input chips that clear their filter, then the total; nothing without filters. */
export function ActiveFilters({ filters, total }: ActiveFiltersProps) {
  const m3 = useThemeM3Colors();
  if (filters.length === 0) return null;

  return (
    <LazyRow verticalAlignment="center" className="gap-2 px-safe-offset-gx">
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
            <Typography type="body-sm" className="text-inherit">
              {f.label}
            </Typography>
          </InputChip.Label>
          <InputChip.TrailingIcon>
            <Icon name={Icons.close} size={18} className="text-inherit" />
          </InputChip.TrailingIcon>
        </InputChip>
      ))}
      {total && (
        <Typography type="body-sm" muted>
          {total}
        </Typography>
      )}
    </LazyRow>
  );
}
