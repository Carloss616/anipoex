import { Rectangle, ZStack } from "@expo/ui/swift-ui";
import {
  clipShape,
  fixedSize,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";
import { cn } from "panelui-native/utils/cn";
import { StyleSheet } from "react-native";
import { useResolveClassNames } from "uniwind";
import { ramp } from "@/utils/ramp";
import { dp } from "@/utils/utils";
import { Column, type ColumnProps } from "../../layout/column";
import { WASH } from "./scrim-gradient";

const STOPS = ramp(WASH);

/**
 * [`ScrimColumn`](./scrim.tsx) as a SwiftUI `ZStack`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/zstack/
 */
export function ScrimColumn({ className, ...props }: ColumnProps) {
  const classStyle = useResolveClassNames(className ?? "");
  const flat = StyleSheet.flatten([classStyle, props.style]) ?? {};
  const radius = dp(flat.borderRadius);

  return (
    // A `Rectangle` takes every point it is offered, so without `fixedSize`
    // the wash would claim the space its content leaves behind.
    <ZStack
      alignment="bottom"
      modifiers={[
        fixedSize({ horizontal: false, vertical: true }),
        ...(radius ? [clipShape("roundedRectangle", radius)] : []),
      ]}
    >
      <Rectangle
        modifiers={[
          foregroundStyle({
            type: "linearGradient",
            colors: STOPS.colors,
            startPoint: { x: 0.5, y: 0 },
            endPoint: { x: 0.5, y: 1 },
          }),
        ]}
      />
      <Column className={cn("w-full", className)} {...props} />
    </ZStack>
  );
}
