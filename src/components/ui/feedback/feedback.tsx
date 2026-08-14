import { PressableFeedback } from "heroui-native/pressable-feedback";
import type { ComponentType, PropsWithChildren, ReactNode } from "react";

export type FeedbackProps<P> = {
  for: ComponentType<PropsWithChildren<P>>;
  onPress?: () => void;
  onLongPress?: () => void;
  children: ReactNode;
} & P;

export function Feedback<P>({
  for: Component,
  onPress,
  onLongPress,
  children,
  ...props
}: FeedbackProps<P>) {
  if (!onPress && !onLongPress)
    return <Component {...(props as P)}>{children}</Component>;

  return (
    <Component asChild {...(props as P)}>
      <PressableFeedback
        onPress={onPress}
        onLongPress={onLongPress}
        className="flex-1"
      >
        {children}
        <PressableFeedback.Highlight />
      </PressableFeedback>
    </Component>
  );
}
