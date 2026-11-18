import { createModifierWithEventListener } from "@expo/ui/jetpack-compose/modifiers";

type RepeatEvent = "start" | "repeat";

/**
 * SwiftUI's `buttonRepeatBehavior` for a Compose button, registered by the
 * local `modules/modifiers`. Compose has none and can't run the button's
 * `onClick` again, so it reports the hold: `start` when a press begins, then
 * `repeat` every 80ms once held 400ms.
 */
export const buttonRepeatBehavior = (onEvent: (type: RepeatEvent) => void) =>
  createModifierWithEventListener(
    "buttonRepeatBehavior",
    ({ type }: { type: RepeatEvent }) => onEvent(type),
  );
