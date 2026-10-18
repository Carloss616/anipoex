import { Column as ColumnBase } from "@expo/ui";
import { withUniwind } from "uniwind";

/**
 * `@expo/ui`'s Column with Uniwind classes, for web: the gap stays in the CSS
 * class, so `spacing` is only read from it, never forced.
 */
export const Column = withUniwind(ColumnBase, {
  style: {
    fromClassName: "className",
  },
  spacing: {
    fromClassName: "className",
    styleProperty: "gap",
  },
});

export type ColumnProps = React.ComponentProps<typeof Column>;
