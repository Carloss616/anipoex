import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Icon, type IconName } from "../icon";

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
}

const R = 8;
const LENGTH = 2 * Math.PI * R;

/** A determinate circular progress, small enough for an icon button. */
export function ProgressRing({ value, size = 18, icon }: ProgressRingProps) {
  const primary = useThemeColor("primary");

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Circle
          cx={10}
          cy={10}
          r={R}
          fill="none"
          stroke={primary}
          strokeOpacity={0.25}
          strokeWidth={2.5}
        />
        <Circle
          cx={10}
          cy={10}
          r={R}
          fill="none"
          stroke={primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={LENGTH}
          strokeDashoffset={LENGTH * (1 - value)}
          transform="rotate(-90 10 10)"
        />
      </Svg>
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
