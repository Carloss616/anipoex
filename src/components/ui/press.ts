import { cn } from "panelui-native/utils/cn";

/**
 * panelui-web Button's press, for any web pressable: 0.97 while `:active`, held
 * while its menu is open (Base UI opens it on mousedown, which ends `:active`).
 */
export const PRESS = cn(
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
  "transition-[scale] duration-150 active:not-disabled:scale-[0.97] data-popup-open:scale-[0.97]",
  "motion-reduce:data-popup-open:scale-100 motion-reduce:active:scale-100",
);
