import {
  LazyVStack as LazyVStackBase,
  type LazyVStackProps as LazyVStackBaseProps,
} from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";

/**
 * `LazyVStack` with uniwind classes: `gap-*` → `spacing` (0 by default, like
 * `Column`), `p-*` → `padding`. iOS only.
 */
function LazyVStackRoot({
  style,
  spacing,
  modifiers = [],
  ...props
}: LazyVStackBaseProps & { style?: StyleProp<ViewStyle> }) {
  const s = StyleSheet.flatten(style) ?? {};
  const insets = {
    all: dp(s.padding),
    horizontal: dp(s.paddingHorizontal),
    vertical: dp(s.paddingVertical),
    top: dp(s.paddingTop),
    bottom: dp(s.paddingBottom),
    leading: dp(s.paddingStart) ?? dp(s.paddingLeft),
    trailing: dp(s.paddingEnd) ?? dp(s.paddingRight),
  };
  const padded = Object.values(insets).some((v) => v != null);

  return (
    <LazyVStackBase
      spacing={spacing ?? dp(s.rowGap) ?? dp(s.gap) ?? 0}
      modifiers={padded ? [padding(insets), ...modifiers] : modifiers}
      {...props}
    />
  );
}

export const LazyVStack = Object.assign(
  withUniwind(LazyVStackRoot, {
    style: {
      fromClassName: "className",
    },
  }),
  { ForEach: LazyVStackBase.ForEach },
);
