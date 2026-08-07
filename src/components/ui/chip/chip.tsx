import {
  Chip as ChipBase,
  type ChipProps as ChipBaseProps,
} from "heroui-native/chip";

export type * from "heroui-native/chip";

export interface ChipProps extends ChipBaseProps {
  selected?: boolean;
}

export function Chip({ selected, variant = "secondary", ...props }: ChipProps) {
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
