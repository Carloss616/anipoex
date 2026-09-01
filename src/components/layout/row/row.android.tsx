import { Row as RowBase, type RowProps as RowBaseProps } from "@expo/ui";
import { FlowRow } from "@expo/ui/jetpack-compose";
import { type StyleProp, StyleSheet, type TextStyle } from "react-native";
import { withUniwind } from "uniwind";
import { resolveFill } from "@/utils/resolve-fill";

export function RowRoot({
  style,
  modifiers,
  spacing = 0,
  ...props
}: RowBaseProps) {
  const { flexWrap } = StyleSheet.flatten(style as StyleProp<TextStyle>) ?? {};
  const styleModifiers = resolveFill({ style, modifiers });

  if (flexWrap === "wrap" && !props.hidden) {
    const arrangement = spacing ? { spacedBy: spacing } : undefined;
    return (
      <FlowRow
        horizontalArrangement={arrangement}
        verticalArrangement={arrangement}
        {...styleModifiers}
        {...props}
      />
    );
  }

  return <RowBase spacing={spacing} {...props} {...styleModifiers} />;
}

export const Row = withUniwind(RowRoot, {
  style: {
    fromClassName: "className",
  },
  spacing: {
    fromClassName: "className",
    styleProperty: "gap",
  },
});
