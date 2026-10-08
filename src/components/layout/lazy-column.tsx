import {
  LazyColumn as LazyColumnBase,
  type LazyColumnProps as LazyColumnBaseProps,
} from "@expo/ui/jetpack-compose";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { contentPaddingOf, dp } from "@/utils/utils";

/**
 * `LazyColumn` with uniwind classes: `gap-*` → `verticalArrangement`,
 * `p-*` → `contentPadding`. Android only.
 */
function LazyColumnRoot({
  style,
  verticalArrangement,
  contentPadding,
  ...props
}: LazyColumnBaseProps & { style?: StyleProp<ViewStyle> }) {
  const s = StyleSheet.flatten(style) ?? {};
  const gap = dp(s.rowGap) ?? dp(s.gap);

  return (
    <LazyColumnBase
      verticalArrangement={
        verticalArrangement ?? (gap ? { spacedBy: gap } : undefined)
      }
      contentPadding={contentPadding ?? contentPaddingOf(s)}
      {...props}
    />
  );
}

export const LazyColumn = Object.assign(
  withUniwind(LazyColumnRoot, {
    style: {
      fromClassName: "className",
    },
  }),
  { Items: LazyColumnBase.Items },
);
