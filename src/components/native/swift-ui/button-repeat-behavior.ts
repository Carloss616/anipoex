import { createModifier } from "@expo/ui/swift-ui/modifiers";

/**
 * SwiftUI's `buttonRepeatBehavior(.enabled)` on a `Button`, registered by the
 * local `modules/modifiers`: held, the button runs its `onPress` again and
 * again. iOS 17 and later; before, a hold is one tap.
 */
export const buttonRepeatBehavior = () =>
  createModifier("buttonRepeatBehavior");
