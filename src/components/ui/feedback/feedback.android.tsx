import { View } from "react-native";
import { RNHostView, useIsInsideHost } from "@/components/ui/host";
import { TouchableNativeFeedback } from "../touchable-native-feedback";
import type { FeedbackProps } from "./feedback";

export function Feedback<P>({
  for: Component,
  onPress,
  onLongPress,
  children,
  ...props
}: FeedbackProps<P>) {
  const isInsideHost = useIsInsideHost();

  const content =
    !onPress && !onLongPress ? (
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

  return isInsideHost ? (
    <RNHostView matchContents>{content}</RNHostView>
  ) : (
    content
  );
}
