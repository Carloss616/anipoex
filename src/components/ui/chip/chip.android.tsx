import {
  type ChipBorder,
  FilterChip,
  type FilterChipColors,
  Text,
} from "@expo/ui/jetpack-compose";
import { testID as testIDModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { textOf } from "@/utils/utils";
import { SEMANTIC_COLOR, type SemanticColor } from "../colors";
import { EnsureHost } from "../host";
import type { ChipLabelProps, ChipProps } from "./chip";
import { COLORS } from "./constants";

function useColors(color: SemanticColor) {
  const themeColor =
    SEMANTIC_COLOR[color === "secondary" ? "primary" : color].token.fill;
  const m3 = useThemeM3Colors(themeColor);
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
 * Android Chip: same props as PanelUI's, rendered as a Jetpack Compose
 * `FilterChip` — the M3 chip that carries a selected state. `size` is a no-op:
 * M3 gives the chip one 32dp height, so a smaller label would only shrink the
 * text inside an unchanged pill.
 *
 * @see https://heroui.com/docs/native/components/chip
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/chip/
 */
export function Chip({
  children,
  selected = false,
  variant = "default",
  disabled: isDisabled = false,
  onPress,
  testID,
}: ChipProps) {
  const semanticColor = COLORS[variant];
  const { colors, border } = useColors(semanticColor);
  const fontFamily = useFontFamily("normal");

  return (
    <EnsureHost matchContents>
      <FilterChip
        selected={selected}
        enabled={!isDisabled}
        onClick={onPress as (() => void) | undefined}
        colors={colors}
        border={border}
        modifiers={testID ? [testIDModifier(testID as string)] : []}
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
