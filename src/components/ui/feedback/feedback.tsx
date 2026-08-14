import { PressableFeedback } from "heroui-native/pressable-feedback";
import type { ComponentType, PropsWithChildren, ReactNode } from "react";

export type FeedbackProps<P> = {
  for: ComponentType<PropsWithChildren<P>>;
  onPress: (() => void) | undefined;
  onLongPress: (() => void) | undefined;
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
      <PressableFeedback onPress={onPress} onLongPress={onLongPress}>
        {children}
        <PressableFeedback.Highlight />
      </PressableFeedback>
    </Component>
  );
}
