import {
  type ChipBorder,
  FilterChip,
  type FilterChipColors,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { useThemeColor } from "heroui-native/hooks";
import { textOf } from "@/utils/utils";
import type { ChipColor, ChipLabelProps, ChipProps } from "./chip";
import { Host, useIsInsideHost } from "./host";

function useColors(color: ChipColor) {
  const seedColor = useThemeColor(color === "default" ? "accent" : color);
  const m3 = useMaterialColors({ seedColor });
  const colors: FilterChipColors = {
    containerColor: m3.surfaceContainerLow,
    labelColor: m3.onSurfaceVariant,
    selectedContainerColor: m3.secondaryContainer,
    selectedLabelColor: m3.onSecondaryContainer,
  };
  const border: ChipBorder = {
    color: m3.outlineVariant,
  };

  return { colors, border };
}

export function Chip({
  children,
  selected = false,
  color = "accent",
  disabled: isDisabled = false,
  onPress,
}: ChipProps) {
  const { colors, border } = useColors(color);
  const isInsideHost = useIsInsideHost();

  const chip = (
    <FilterChip
      selected={selected}
      enabled={!isDisabled}
      onClick={onPress as (() => void) | undefined}
      colors={colors}
      border={border}
    >
      <FilterChip.Label>
        <Text>{textOf(children)}</Text>
      </FilterChip.Label>
    </FilterChip>
  );

  return isInsideHost ? chip : <Host matchContents>{chip}</Host>;
}

function ChipLabel(_: ChipLabelProps) {
  return null;
}

Chip.Label = ChipLabel;
