import { HorizontalDivider, VerticalDivider } from "@expo/ui/jetpack-compose";
import {
  fillMaxHeight,
  fillMaxWidth,
  height as heightModifier,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";
import { EnsureHost } from "./host";
import type { SeparatorProps } from "./separator";

/** heroui's `thick` rule, in dp. */
const THICK = 6;

function SeparatorBase({
  orientation = "horizontal",
  variant = "thin",
  thickness,
  style,
  testID,
}: SeparatorProps) {
  const vertical = orientation === "vertical";
  const size =
    thickness ?? (variant === "thick" ? THICK : StyleSheet.hairlineWidth);
  // A Compose Row sizes itself to its children, so it can't answer
  // `fillMaxHeight` — a vertical rule inside one needs a height of its own.
  const height = dp(StyleSheet.flatten(style)?.height);
  const modifiers = [
    vertical
      ? height
        ? heightModifier(height)
        : fillMaxHeight()
      : fillMaxWidth(),
    ...(testID ? [testIDModifier(testID)] : []),
  ];

  return (
    <EnsureHost
      // Fill along the run, hug the rule across it.
      matchContents={{ vertical: !vertical, horizontal: vertical }}
      className={vertical ? "h-full" : "w-full"}
    >
      {vertical ? (
        <VerticalDivider thickness={size} modifiers={modifiers} />
      ) : (
        <HorizontalDivider thickness={size} modifiers={modifiers} />
      )}
    </EnsureHost>
  );
}

/**
 * Android Separator: same props as [the web one](./separator.tsx), drawn as
 * M3's `HorizontalDivider` / `VerticalDivider`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/divider/
 */
export const Separator = withUniwind(SeparatorBase);
