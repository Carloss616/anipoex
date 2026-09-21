import { cloneElement, type ReactElement, type ReactNode } from "react";
import { View } from "react-native";
import type { FeedbackProps } from "@/components/ui/feedback";
import { TouchableNativeFeedback } from "@/components/ui/touchable-native-feedback";

/**
 * Redraws the shared Feedback in plain RN Yoga: its Android one mounts a `<Host>`, one `ComposeView` per row inside LegendList.
 * The ripple goes inside the child (the card) so its rounded clip cuts the ripple too.
 */
export function Feedback({ onPress, onLongPress, children }: FeedbackProps) {
  if (!onPress && !onLongPress) return children;

  const child = children as ReactElement<{ children?: ReactNode }>;
  return cloneElement(
    child,
    undefined,
    <TouchableNativeFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      useForeground
    >
      <View className="flex-1">{child.props.children}</View>
    </TouchableNativeFeedback>,
  );
}
