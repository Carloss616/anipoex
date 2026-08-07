import {
  type ChipBorder,
  FilterChip,
  type FilterChipColors,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { useThemeColor } from "heroui-native/hooks";
import { useFontFamily } from "@/hooks/use-font";
import { textOf } from "@/utils/utils";
import { EnsureHost } from "../host";
import type { ChipColor, ChipLabelProps, ChipProps } from "./chip";

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

/**
 * Android Chip: same props as `heroui-native`'s, rendered as a Jetpack Compose
 * `FilterChip` — the M3 chip that carries a selected state.
 *
 * @see https://heroui.com/docs/native/components/chip
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/chip/
 */
export function Chip({
  children,
  selected = false,
  color = "accent",
  disabled: isDisabled = false,
  onPress,
}: ChipProps) {
  const { colors, border } = useColors(color);
  const fontFamily = useFontFamily("normal");

  return (
    <EnsureHost matchContents>
      <FilterChip
        selected={selected}
        enabled={!isDisabled}
        onClick={onPress as (() => void) | undefined}
        colors={colors}
        border={border}
      >
        <FilterChip.Label>
          <Text style={{ fontFamily }}>{textOf(children)}</Text>
        </FilterChip.Label>
      </FilterChip>
    </EnsureHost>
  );
}

function ChipLabel(_: ChipLabelProps) {
  return null;
}

Chip.Label = ChipLabel;
