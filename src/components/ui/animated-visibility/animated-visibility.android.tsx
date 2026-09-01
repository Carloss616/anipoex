import {
  AnimatedVisibility as AnimatedVisibilityBase,
  EnterTransition,
  ExitTransition,
} from "@expo/ui/jetpack-compose";
import { useRef } from "react";
import type { AnimatedVisibilityProps } from "./animated-visibility";

/**
 * Compose's default transitions fade as well; these don't.
 */
export function AnimatedVisibility({
  visible,
  children,
}: AnimatedVisibilityProps) {
  const last = useRef(children);
  if (visible) last.current = children;

  return (
    <AnimatedVisibilityBase
      visible={visible}
      enterTransition={EnterTransition.expandVertically()}
      exitTransition={ExitTransition.shrinkVertically()}
    >
      {last.current}
    </AnimatedVisibilityBase>
  );
}
