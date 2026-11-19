import {
  foregroundStyle,
  listRowSeparator,
  padding,
  textCase,
} from "@expo/ui/swift-ui/modifiers";
import { memo } from "react";
import { Text } from "@/components/native/swift-ui/text";
import type { DayRowProps } from "./day-row";

/** A day's label, as a plain list's section header reads. */
export const DayRow = memo(function DayRow({ label }: DayRowProps) {
  return (
    <Text
      textStyle="footnote"
      weight="semibold"
      modifiers={[
        foregroundStyle("secondary"),
        textCase("uppercase"),
        padding({ top: 12 }),
        listRowSeparator("hidden"),
      ]}
    >
      {label}
    </Text>
  );
});
