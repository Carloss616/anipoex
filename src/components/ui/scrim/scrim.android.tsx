import { Box } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  matchParentSize,
} from "@expo/ui/jetpack-compose/modifiers";
import { cn } from "panelui-native/utils/cn";
import { Column, type ColumnProps } from "../../layout/column";
import { ScrimGradient } from "./scrim-gradient";

/**
 * [`ScrimColumn`](./scrim.tsx) as a Jetpack Compose `Box`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/box/
 */
export function ScrimColumn({ className, ...props }: ColumnProps) {
  return (
    <Box modifiers={[fillMaxWidth()]}>
      {/* `matchParentSize` keeps the ramp out of the box's measurement, so
          the content is what sets the height. */}
      <Column modifiers={[matchParentSize()]}>
        <ScrimGradient colorClassName="accent-black" />
      </Column>
      <Column className={cn("w-full", className)} {...props} />
    </Box>
  );
}
