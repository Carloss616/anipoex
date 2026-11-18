import { View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Icon, type IconName } from "../icon";
import { SvgRing } from "./svg-ring";

export interface ProgressRingProps {
  /** 0 to 1. */
  value: number;
  /** Diameter, in points. */
  size?: number;
  /** A glyph in the middle: what a press does. */
  icon?: IconName;
  /**
   * Holds the ring's wave still.
   * @platform android
   */
  paused?: boolean;
  stroke?: number;
}

/** A determinate circular progress, small enough for an icon button. */
export function ProgressRing({
  value,
  size = 18,
  icon,
  stroke,
}: ProgressRingProps) {
  const primary = useThemeColor("primary");

  return (
    <View className="items-center justify-center">
      <SvgRing value={value} size={size} stroke={stroke} />
      {icon && (
        <Icon
          name={icon}
          size={Math.round(size / 2)}
          color={primary}
          className="absolute"
        />
      )}
    </View>
  );
}
