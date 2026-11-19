import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { DayRowProps } from "./day-row";

/** A day's label over its group; it scrolls away (no sticky header in @expo/ui). */
export const DayRow = memo(function DayRow({ label }: DayRowProps) {
  const m3 = useThemeM3Colors();
  return (
    <Text
      style={{ typography: "titleSmall" }}
      color={m3.primary}
      modifiers={[padding(GUTTER, 16, GUTTER, 8)]}
    >
      {label}
    </Text>
  );
});
