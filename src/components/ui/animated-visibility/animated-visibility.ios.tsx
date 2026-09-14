import {
  Animation,
  accessibilityHidden,
  animation,
  clipped,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { useRef } from "react";
import { Column } from "@/components/layout/column";
import type { AnimatedVisibilityProps } from "./animated-visibility";

/**
 * SwiftUI animates a change only from a view that outlives it, so the content
 * stays mounted and it is this column's height that opens and closes.
 */
export function AnimatedVisibility({
  visible,
  children,
}: AnimatedVisibilityProps) {
  const last = useRef(children);
  if (visible) last.current = children;

  return (
    <Column
      modifiers={[
        frame({ maxHeight: visible ? Infinity : 0, alignment: "topLeading" }),
        clipped(),
        // Clipping only hides it from the eye. The content stays in the view
        // tree, so without this VoiceOver reads what is closed — and the two
        // copies a disclosure keeps mounted get read one after the other.
        accessibilityHidden(!visible),
        animation(Animation.easeInOut({ duration: 0.3 }), visible),
      ]}
    >
      {last.current}
    </Column>
  );
}
