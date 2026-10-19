import type { ModifierConfig } from "@expo/ui/swift-ui/modifiers";
import { useRef } from "react";

type PressRepeatEvent = { type: "start" | "repeat" };

// Type-only import: Compose's ModifierConfig has the same shape, so Android takes it too.
const onPressRepeat = (
  handler: (event: PressRepeatEvent) => void,
): ModifierConfig => ({ $type: "onPressRepeat", eventListener: handler });

/**
 * Step buttons that repeat while held. A tap steps once through the button's
 * own `onPress`; holding it repeats through the native `onPressRepeat`
 * modifier (modules/press-repeat), and the `onPress` that ends a hold is
 * skipped so the release doesn't add one more step.
 */
export function useStepRepeat(
  value: number,
  clamp: (next: number) => number,
  emit: (next: number) => void,
  disabled: boolean,
) {
  // Ticks land faster than renders, so each one steps from the last it sent.
  const latest = useRef(value);
  latest.current = value;
  const held = useRef(false);

  const stepBy = (delta: number) => {
    const next = clamp(latest.current + delta);
    if (disabled || next === latest.current) return;
    latest.current = next;
    emit(next);
  };

  return (delta: number) => ({
    onPress: () => {
      if (held.current) held.current = false;
      else stepBy(delta);
    },
    modifier: onPressRepeat(({ type }) => {
      held.current = type === "repeat";
      if (held.current) stepBy(delta);
    }),
  });
}
