import Svg, { Circle } from "react-native-svg";
import { useThemeColor } from "@/hooks/use-theme-color";

/** The ring itself, drawn in `size`'s own points so the stroke never scales. */
export function SvgRing({
  value,
  size,
  stroke = 2.5,
}: {
  value: number;
  size: number;
  stroke?: number;
}) {
  const primary = useThemeColor("primary");
  const c = size / 2;
  const r = c - stroke / 2;
  const length = 2 * Math.PI * r;

  return (
    // Inline, over panelui-web Button's `[&_svg]:size-4`, which would clip it.
    <Svg style={{ width: size, height: size }}>
      <Circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={primary}
        strokeOpacity={0.25}
        strokeWidth={stroke}
      />
      <Circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={primary}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - value)}
        transform={`rotate(-90 ${c} ${c})`}
      />
    </Svg>
  );
}
