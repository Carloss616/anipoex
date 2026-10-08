import {
  LazyRow as LazyRowBase,
  type LazyRowProps as LazyRowBaseProps,
} from "@expo/ui/jetpack-compose";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { contentPaddingOf, dp } from "@/utils/utils";

/**
 * `LazyRow` with uniwind classes: `gap-*` → `horizontalArrangement`,
 * `p-*` → `contentPadding`. Android only.
 */
function LazyRowRoot({
  style,
  horizontalArrangement,
  contentPadding,
  ...props
}: LazyRowBaseProps & { style?: StyleProp<ViewStyle> }) {
  const s = StyleSheet.flatten(style) ?? {};
  const gap = dp(s.columnGap) ?? dp(s.gap);

  return (
    <LazyRowBase
      horizontalArrangement={
        horizontalArrangement ?? (gap ? { spacedBy: gap } : undefined)
      }
      contentPadding={contentPadding ?? contentPaddingOf(s)}
      {...props}
    />
  );
}

export const LazyRow = Object.assign(
  withUniwind(LazyRowRoot, {
    style: {
      fromClassName: "className",
    },
  }),
  { Items: LazyRowBase.Items },
);
