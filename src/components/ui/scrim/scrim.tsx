import { cn } from "panelui-native/utils/cn";
import { Column, type ColumnProps } from "@/components/layout/column";
import { ScrimGradient, WASH } from "./scrim-gradient";

/**
 * Lays its children over a dark wash, so text stays legible on top of artwork.
 * `overflow-hidden` so a rounded `className` clips the wash too.
 */
export function ScrimColumn({ children, className, ...props }: ColumnProps) {
  return (
    <Column className={cn("overflow-hidden", className)} {...props}>
      <ScrimGradient color={WASH} />
      {children}
    </Column>
  );
}
