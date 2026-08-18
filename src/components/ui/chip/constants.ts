import type { ChipVariant } from "panelui-native/components/chip";
import type { SemanticColor } from "../colors";

export const COLORS = {
  default: "primary",
  primary: "primary",
  outline: "primary",
  success: "success",
  warning: "warning",
  info: "primary",
  destructive: "destructive",
} as const satisfies Record<ChipVariant, SemanticColor>;
