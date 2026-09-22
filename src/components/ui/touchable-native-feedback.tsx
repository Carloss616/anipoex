import {
  TouchableNativeFeedback as RNTouchableNativeFeedback,
  type TouchableNativeFeedbackProps,
} from "react-native";
import { useThemeM3Colors } from "@/hooks/use-theme";

/**
 * Android's default ripple keeps the old theme's color. Ours comes from a theme
 * token, so it updates on a switch without remounting the card.
 */
export function TouchableNativeFeedback(props: TouchableNativeFeedbackProps) {
  const m3 = useThemeM3Colors();

  return (
    <RNTouchableNativeFeedback
      // M3 colors are `#RRGGBBAA`; swap the alpha for Material's 12% pressed layer.
      background={
        m3
          ? RNTouchableNativeFeedback.Ripple(
              `${m3.primary.slice(0, 7)}1F`,
              false,
            )
          : undefined
      }
      {...props}
    />
  );
}
