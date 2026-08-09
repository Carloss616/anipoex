import {
  TouchableNativeFeedback as RNTouchableNativeFeedback,
  type TouchableNativeFeedbackProps,
} from "react-native";
import { useUniwind } from "uniwind";

export function TouchableNativeFeedback(props: TouchableNativeFeedbackProps) {
  const { theme } = useUniwind();

  // key is to force re-render when theme changes, so ripple color is correct
  return <RNTouchableNativeFeedback key={theme} {...props} />;
}
