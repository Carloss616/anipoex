import { AnimatedPressable } from "panelui-native";
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
    <Component {...(props as P)}>
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        className="flex-1"
      >
        {children}
      </AnimatedPressable>
    </Component>
  );
}
