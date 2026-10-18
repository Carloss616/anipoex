import { Box } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  paddingAll,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useCSSVariable } from "uniwind";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";
import type { SourceTileProps } from "./source-tile";

const SIDE = 40;

export function SourceTile({ initials, color }: SourceTileProps) {
  const border = useThemeColor("border");
  // Each theme family sets its own rounding, so `rounded-lg` is read, not fixed.
  const radius = dp(useCSSVariable("--radius-lg") as string | number) ?? 8;

  return (
    <Box
      contentAlignment="center"
      modifiers={[
        size(SIDE, SIDE),
        clip(Shapes.RoundedCorner(radius)),
        // Compose's `border()` takes no shape, so the rounded border is its
        // color showing through a hairline gap.
        background(border),
        paddingAll(1),
        clip(Shapes.RoundedCorner(radius - 1)),
        background(color),
      ]}
    >
      <Text style={{ typography: "bodySmall", fontWeight: "600" }}>
        {initials}
      </Text>
    </Box>
  );
}
