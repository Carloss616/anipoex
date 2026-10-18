import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export interface TriggerProps {
  children: ReactElement<{ onPress?: (...args: unknown[]) => void }>;
}

/**
 * Marks the element that opens the dialog. Neither Jetpack Compose's
 * `AlertDialog` nor `@expo/ui`'s Trigger slot manage this themselves, so
 * `extractTrigger` below reads back what it wraps.
 */
export function Trigger({ children }: TriggerProps) {
  return children;
}

/** Clones the `<Dialog.Trigger>` child so pressing it opens the dialog. */
export function extractTrigger(
  children: ReactNode,
  onOpen: () => void,
): ReactNode {
  const trigger = Children.only(children);
  if (!isValidElement<TriggerProps>(trigger)) return trigger;

  const inner = trigger.props.children;
  if (!isValidElement(inner)) return inner;

  return cloneElement(inner, {
    onPress: (...args: unknown[]) => {
      (inner.props as { onPress?: (...args: unknown[]) => void }).onPress?.(
        ...args,
      );
      onOpen();
    },
  });
}
