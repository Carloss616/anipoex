import type {
  PressableFeedbackHighlightProps,
  PressableFeedbackProps,
  PressableFeedbackRippleProps,
  PressableFeedbackScaleProps,
} from "heroui-native/pressable-feedback";
import { Children } from "react";
import {
  TouchableNativeFeedback as TouchableNativeFeedbackBase,
  type TouchableNativeFeedbackProps,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const TouchableNativeFeedback = withUniwind(TouchableNativeFeedbackBase);

export function PressableFeedback({
  children,
  className,
  ...props
}: PressableFeedbackProps) {
  return (
    <TouchableNativeFeedback
      {...(props as TouchableNativeFeedbackProps)}
      className={className}
      useForeground
    >
      {Children.count(children) === 1 ? children : <View>{children}</View>}
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
