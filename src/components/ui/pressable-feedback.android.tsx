import type {
  PressableFeedbackHighlightProps,
  PressableFeedbackProps,
  PressableFeedbackRippleProps,
  PressableFeedbackScaleProps,
} from "heroui-native/pressable-feedback";
import {
  type StyleProp,
  TouchableNativeFeedback,
  type TouchableNativeFeedbackProps,
  View,
  type ViewStyle,
} from "react-native";
import { useUniwind } from "uniwind";

/**
 * Android PressableFeedback: same props as `heroui-native`'s, backed by
 * `TouchableNativeFeedback` so a press draws the platform ripple instead. The
 * `Highlight`/`Ripple`/`Scale` children are inert — the ripple is the feedback.
 *
 * @see https://heroui.com/docs/native/components/pressable-feedback
 * @see https://reactnative.dev/docs/touchablenativefeedback
 */
export function PressableFeedback({
  children,
  className,
  style,
  ...props
}: PressableFeedbackProps) {
  const { theme } = useUniwind();

  return (
    <TouchableNativeFeedback
      key={theme}
      useForeground
      {...(props as TouchableNativeFeedbackProps)}
    >
      <View className={className} style={style as StyleProp<ViewStyle>}>
        {children}
      </View>
    </TouchableNativeFeedback>
  );
}

function PressableFeedbackHighlight(_: PressableFeedbackHighlightProps) {
  return null;
}

function PressableFeedbackRipple(_: PressableFeedbackRippleProps) {
  return null;
}

function PressableFeedbackScale(_: PressableFeedbackScaleProps) {
  return null;
}

PressableFeedback.Highlight = PressableFeedbackHighlight;
PressableFeedback.Ripple = PressableFeedbackRipple;
PressableFeedback.Scale = PressableFeedbackScale;
