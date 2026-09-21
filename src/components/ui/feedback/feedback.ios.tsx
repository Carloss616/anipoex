import { Button } from "@expo/ui/swift-ui";
import { buttonStyle, onLongPressGesture } from "@expo/ui/swift-ui/modifiers";
import { EnsureHost } from "@/components/ui/host";
import type { FeedbackProps } from "./feedback";

export function Feedback({ onPress, onLongPress, children }: FeedbackProps) {
  return !onPress && !onLongPress ? (
    children
  ) : (
    <EnsureHost matchContents>
      <Button
        onPress={onPress}
        modifiers={[
          buttonStyle("borderless"),
          ...(onLongPress ? [onLongPressGesture(onLongPress)] : []),
        ]}
      >
        {children}
      </Button>
    </EnsureHost>
  );
}
