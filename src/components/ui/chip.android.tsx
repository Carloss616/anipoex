import {
  FilterChip,
  type FilterChipColors,
  Host,
  Text,
} from "@expo/ui/jetpack-compose";
import type { ChipLabelProps, ChipProps } from "heroui-native/chip";
import { useThemeColor } from "heroui-native/hooks";
import { textOf } from "@/utils/utils";

function useColors(
  color: ChipProps["color"] = "default",
  variant: ChipProps["variant"] = "secondary",
): FilterChipColors | undefined {
  const [
    accentSoft,
    accent,
    dangerSoft,
    danger,
    defaultSoftForeground,
    defaultSoft,
    defaultColor,
    successSoft,
    success,
    warningSoft,
    warning,
  ] = useThemeColor([
    "accent-soft",
    "accent",
    "danger-soft",
    "danger",
    "default-soft-foreground",
    "default-soft",
    "default",
    "success-soft",
    "success",
    "warning-soft",
    "warning",
  ]);

  const theme = {
    accent,
    danger,
    default: defaultColor,
    defaultSoftForeground,
    success,
    successSoft,
    warning,
    warningSoft,
    accentSoft,
    dangerSoft,
    defaultSoft,
  };

  if (variant === "primary") {
    return {
      containerColor: undefined,
      labelColor: undefined,
      selectedContainerColor: color === "default" ? theme.default : undefined,
      selectedLabelColor:
        color === "default" ? theme.defaultSoftForeground : undefined,
    };
  }

  if (variant === "secondary") {
    return {
      containerColor: undefined,
      labelColor: undefined,
      selectedContainerColor: theme.default,
      selectedLabelColor:
        color === "default" ? theme.defaultSoftForeground : theme[color],
    };
  }

  if (variant === "tertiary") {
    return {
      containerColor: undefined,
      labelColor:
        color === "default" ? theme.defaultSoftForeground : theme[color],
      selectedContainerColor: undefined,
      selectedLabelColor: undefined,
    };
  }

  // variant === "soft"
  return {
    containerColor: theme[`${color}Soft`],
    labelColor:
      color === "default" ? theme.defaultSoftForeground : theme[color],
    selectedContainerColor: undefined,
    selectedLabelColor: undefined,
  };
}

export function Chip({
  children,
  variant = "primary",
  color = "accent",
  disabled,
  onPress,
}: ChipProps) {
  const colors = useColors(color, variant);

  return (
    <Host matchContents>
      <FilterChip
        selected={variant === "primary" || variant === "secondary"}
        enabled={!disabled}
        onClick={onPress as (() => void) | undefined}
        colors={colors}
      >
        <FilterChip.Label>
          <Text>{textOf(children)}</Text>
        </FilterChip.Label>
      </FilterChip>
    </Host>
  );
}

function ChipLabel(_props: ChipLabelProps) {
  return null;
}

Chip.Label = ChipLabel;
