import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { EnsureRNHostView } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { type RampOptions, ramp } from "@/utils/ramp";

/** What a wash is painted in, as against the page colour that blends an edge. */
export const WASH = "#000000";

export interface ScrimGradientProps extends RampOptions {
  /** What the ramp arrives at. Defaults to the page colour. */
  color?: string;
}

/**
 * A ramp with no layout of its own, filling its parent. Give the parent the
 * padding and stack the children after it.
 */
export function ScrimGradient({ color, ...options }: ScrimGradientProps) {
  const background = useThemeColor("background");
  const m3 = useThemeM3Colors();
  const stops = ramp(color ?? m3?.background ?? background, options);

  return (
    <EnsureRNHostView className="flex-1">
      <LinearGradient {...stops} style={StyleSheet.absoluteFill} />
    </EnsureRNHostView>
  );
}
