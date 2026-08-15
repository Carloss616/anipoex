import {
  Chip as ChipBase,
  type ChipProps as ChipBaseProps,
} from "heroui-native/chip";
import type { SemanticColor } from "../colors";

export type * from "heroui-native/chip";

export interface ChipProps extends Omit<ChipBaseProps, "color"> {
  selected?: boolean;
  /**
   * Only the native chips tint themselves off a colour; here the `variant`
   * carries it, so this is accepted and ignored.
   */
  color?: SemanticColor;
}

export function Chip({
  selected,
  variant = "secondary",
  color: _color,
  ...props
}: ChipProps) {
  return (
    <ChipBase
      variant={
        selected ? (variant === "tertiary" ? "secondary" : "primary") : variant
      }
      {...props}
    />
  );
}

Chip.Label = ChipBase.Label;
