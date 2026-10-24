import { Chip as PanelChip } from "panelui-native/components/chip";
import { cn } from "panelui-native/utils/cn";
import { type ComponentProps, forwardRef } from "react";
import type { View } from "react-native";
import { FOCUS_RING, HOVER } from "./constants";

export * from "panelui-native/components/chip";

const ChipRoot = forwardRef<View, ComponentProps<typeof PanelChip>>(
  function Chip({ className, ...props }, ref) {
    return (
      <PanelChip
        ref={ref}
        {...props}
        className={cn(props.onPress && [FOCUS_RING, HOVER], className)}
      />
    );
  },
);

/** PanelUI's Chip with a themed focus ring and hover on web, when it can be pressed. */
export const Chip = Object.assign(ChipRoot, { Label: PanelChip.Label });
