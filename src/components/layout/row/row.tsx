import { Row as RowBase, type RowProps } from "@expo/ui";
import { Platform } from "react-native";
import { withUniwind } from "uniwind";
import { resolveFill } from "@/utils/resolve-fill";

/**
 * SwiftUI stacks space their children by default; Compose and the web start at
 * zero, so only a `gap-*` should ever open one. On web that gap lives in the CSS
 * class rather than in `spacing`, and an inline `gap: 0` would outrank it.
 */
const DEFAULT_SPACING = Platform.OS === "web" ? undefined : 0;

function RowRoot({
  style,
  modifiers,
  spacing = DEFAULT_SPACING,
  ...props
}: RowProps) {
  return (
    <RowBase
      spacing={spacing}
      {...props}
      {...resolveFill({ style, modifiers })}
    />
  );
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
