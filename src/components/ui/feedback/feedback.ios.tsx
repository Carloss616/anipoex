import { Button } from "@expo/ui/swift-ui";
import { buttonStyle, onLongPressGesture } from "@expo/ui/swift-ui/modifiers";
import { EnsureHost } from "@/components/ui/host";
import type { FeedbackProps } from "./feedback";

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
    <EnsureHost matchContents>
      <Button
        onPress={onPress}
        modifiers={[
          buttonStyle("borderless"),
          ...(onLongPress ? [onLongPressGesture(onLongPress)] : []),
        ]}
      >
        <Component {...(props as P)}>{children}</Component>
      </Button>
    </EnsureHost>
  );
}
