import { Column as ColumnBase } from "@expo/ui";
import { withUniwind } from "uniwind";

export const Column = withUniwind(ColumnBase, {
  style: {
    fromClassName: "className",
  },
  spacing: {
    fromClassName: "className",
    styleProperty: "gap",
  },
});
