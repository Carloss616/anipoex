import { contentShape, frame, shapes } from "@expo/ui/swift-ui/modifiers";

/** A list row's content fills the row, so tap, long-press and swipe land anywhere on it. */
export const ROW_FILL = [
  frame({ maxWidth: Infinity, alignment: "leading" }),
  contentShape(shapes.rectangle()),
];
