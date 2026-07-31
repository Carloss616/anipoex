import { Row as RowBase } from "@expo/ui";
import { withUniwind } from "uniwind";

export const Row = withUniwind(RowBase, {
  style: {
    fromClassName: "className",
  },
  spacing: {
    fromClassName: "className",
    styleProperty: "gap",
  },
});
