import { HorizontalDivider, VerticalDivider } from "@expo/ui/jetpack-compose";
import {
  fillMaxHeight,
  fillMaxWidth,
  height as heightModifier,
  padding,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";
import { EnsureHost } from "../host";
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
  const {
    height: styleHeight,
    marginHorizontal,
    marginVertical,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
  } = StyleSheet.flatten(style) ?? {};
  // A Compose Row sizes itself to its children, so it can't answer
  // `fillMaxHeight` — a vertical rule inside one needs a height of its own.
  const height = dp(styleHeight);
  const modifiers = [
    // Compose has no margins either, so an inset rule — `mx-4` between list
    // rows — asks for the gap as padding, before the fill measures what's left.
    padding(
      dp(marginLeft ?? marginHorizontal) ?? 0,
      dp(marginTop ?? marginVertical) ?? 0,
      dp(marginRight ?? marginHorizontal) ?? 0,
      dp(marginBottom ?? marginVertical) ?? 0,
    ),
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
