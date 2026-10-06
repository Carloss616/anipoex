import {
  LazyColumn as LazyColumnBase,
  type LazyColumnProps as LazyColumnBaseProps,
} from "@expo/ui/jetpack-compose";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";

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
  const all = dp(s.padding);
  const x = dp(s.paddingHorizontal) ?? all;
  const y = dp(s.paddingVertical) ?? all;

  return (
    <LazyColumnBase
      verticalArrangement={
        verticalArrangement ?? (gap ? { spacedBy: gap } : undefined)
      }
      contentPadding={
        contentPadding ?? {
          top: dp(s.paddingTop) ?? y,
          bottom: dp(s.paddingBottom) ?? y,
          start: dp(s.paddingStart) ?? dp(s.paddingLeft) ?? x,
          end: dp(s.paddingEnd) ?? dp(s.paddingRight) ?? x,
        }
      }
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
