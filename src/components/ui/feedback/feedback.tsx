import { AnimatedPressable } from "panelui-native";
import type { ReactElement } from "react";

export type FeedbackProps = {
  onPress?: () => void;
  onLongPress?: () => void;
  children: ReactElement;
};

export function Feedback({ onPress, onLongPress, children }: FeedbackProps) {
  if (!onPress && !onLongPress) return children;

  return (
    <AnimatedPressable onPress={onPress} onLongPress={onLongPress}>
      {children}
    </AnimatedPressable>
  );
}
