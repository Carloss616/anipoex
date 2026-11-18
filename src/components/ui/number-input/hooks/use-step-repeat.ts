import { useRef } from "react";
import { Platform } from "react-native";
import { buttonRepeatBehavior as composeRepeat } from "@/components/native/jetpack-compose/button-repeat-behavior";
import { buttonRepeatBehavior as swiftUIRepeat } from "@/components/native/swift-ui/button-repeat-behavior";

/**
 * Step buttons that repeat while held, through `buttonRepeatBehavior`. On iOS
 * SwiftUI runs the button's `onPress` again on each repeat. On Android it
 * sends events instead: a tap steps through `onPress`, holding repeats through
 * the events, and the `onPress` that ends a hold is skipped so the release
 * doesn't add one more step.
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

  return Platform.OS === "ios"
    ? (delta: number) => ({
        onPress: () => stepBy(delta),
        modifier: swiftUIRepeat(),
      })
    : (delta: number) => ({
        onPress: () => {
          if (held.current) held.current = false;
          else stepBy(delta);
        },
        modifier: composeRepeat((type) => {
          held.current = type === "repeat";
          if (held.current) stepBy(delta);
        }),
      });
}
