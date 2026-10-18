import { ZStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
  strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { useCSSVariable } from "uniwind";
import { Text } from "@/components/native/swift-ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import type { SourceTileProps } from "./source-tile";

const SIDE = 40;

export function SourceTile({ initials, color }: SourceTileProps) {
  const border = useThemeColor("border");
  // Each theme family sets its own rounding, so `rounded-lg` is read, not fixed.
  const radius = dp(useCSSVariable("--radius-lg") as string | number) ?? 8;

  return (
    <ZStack
      modifiers={[
        frame({ width: SIDE, height: SIDE }),
        background(color),
        clipShape("roundedRectangle", radius),
        strokeBorder({
          content: border,
          shape: "roundedRectangle",
          cornerRadius: radius,
        }),
      ]}
    >
      {/* Its own color: as a `Label` icon in a `List` it would take the tint. */}
      <Text
        textStyle="caption"
        weight="semibold"
        modifiers={[foregroundStyle("primary")]}
      >
        {initials}
      </Text>
    </ZStack>
  );
}
