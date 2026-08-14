import { View } from "react-native";
import type { FeedbackProps } from "@/components/ui/feedback";
import { TouchableNativeFeedback } from "@/components/ui/touchable-native-feedback";

/** Redraws the shared Feedback in plain RN Yoga: its Android one mounts a `<Host>`, one `ComposeView` per row inside LegendList. */
export function Feedback<P>({
  for: Component,
  onPress,
  onLongPress,
  children,
  ...props
}: FeedbackProps<P>) {
  return !onPress && !onLongPress ? (
    <Component {...(props as P)}>{children}</Component>
  ) : (
    <Component {...(props as P)}>
      <TouchableNativeFeedback
        onPress={onPress}
        onLongPress={onLongPress}
        useForeground
      >
        <View className="flex-1">{children}</View>
      </TouchableNativeFeedback>
    </Component>
  );
}
