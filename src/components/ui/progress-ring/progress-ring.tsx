import Svg, { Circle } from "react-native-svg";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface ProgressRingProps {
  /** 0 to 1. */
  value: number;
  /** Diameter, in points. */
  size?: number;
}

const R = 8;
const LENGTH = 2 * Math.PI * R;

/** A determinate circular progress, small enough for an icon button. */
export function ProgressRing({ value, size = 18 }: ProgressRingProps) {
  const primary = useThemeColor("primary");

  return (
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
  );
}
