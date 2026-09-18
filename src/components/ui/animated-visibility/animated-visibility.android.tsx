import {
  AnimatedVisibility as AnimatedVisibilityBase,
  EnterTransition,
  ExitTransition,
} from "@expo/ui/jetpack-compose";
import { useRef } from "react";
import type { AnimatedVisibilityProps } from "./animated-visibility";

/** Vertical only, unlike Compose's defaults; the fade blends two of these overlapping. */
export function AnimatedVisibility({
  visible,
  children,
}: AnimatedVisibilityProps) {
  const last = useRef(children);
  if (visible) last.current = children;

  return (
    <AnimatedVisibilityBase
      visible={visible}
      enterTransition={EnterTransition.expandVertically().plus(
        EnterTransition.fadeIn(),
      )}
      exitTransition={ExitTransition.shrinkVertically().plus(
        ExitTransition.fadeOut(),
      )}
    >
      {last.current}
    </AnimatedVisibilityBase>
  );
}
