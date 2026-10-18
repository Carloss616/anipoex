import { LinearGradient } from "expo-linear-gradient";
import type { StyleProp, ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { EnsureRNHostView } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { type RampOptions, ramp } from "@/utils/ramp";

export interface ScrimGradientProps extends RampOptions {
  /** What the ramp arrives at. Defaults to the page color. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

function ScrimGradientBase({ color, style, ...options }: ScrimGradientProps) {
  const background = useThemeColor("background");
  const m3 = useThemeM3Colors();
  const stops = ramp(color ?? m3?.background ?? background, options);

  return (
    <EnsureRNHostView className="flex-1">
      <LinearGradient {...stops} style={[{ flex: 1 }, style]} />
    </EnsureRNHostView>
  );
}

/**
 * A ramp with no layout of its own, filling its parent. Give the parent the
 * padding and stack the children after it.
 */
export const ScrimGradient = withUniwind(ScrimGradientBase);
