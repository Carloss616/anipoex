import { useThemeColor } from "heroui-native/hooks";
import type { SpinnerProps } from "heroui-native/spinner";

const NAMED = ["accent", "default", "success", "warning", "danger"] as const;

/** heroui's `color` prop is either a theme name or a raw color string. */
export function useSpinnerColor(color: NonNullable<SpinnerProps["color"]>) {
  const named = (NAMED as readonly string[]).includes(color);
  const themed = useThemeColor(
    named ? (color as (typeof NAMED)[number]) : "default",
  );
  return named ? (themed as string) : color;
}
