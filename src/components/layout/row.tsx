import { Row as RowBase } from "@expo/ui";
import { withUniwind } from "uniwind";

/**
 * `@expo/ui`'s Row with Uniwind classes, for web: the gap stays in the CSS
 * class, so `spacing` is only read from it, never forced.
 */
export const Row = withUniwind(RowBase, {
  style: {
    fromClassName: "className",
  },
  spacing: {
    fromClassName: "className",
    styleProperty: "gap",
  },
});

export type RowProps = React.ComponentProps<typeof Row>;
