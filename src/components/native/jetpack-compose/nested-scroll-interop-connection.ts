import { createModifier } from "@expo/ui/jetpack-compose/modifiers";

/**
 * Compose's `rememberNestedScrollInteropConnection()` on a scrolling list's
 * parent, registered by the local `modules/modifiers`: a list in a native form
 * sheet hands the sheet what it doesn't scroll, so the sheet doesn't take the
 * list's drags.
 */
export const nestedScrollInteropConnection = () =>
  createModifier("nestedScrollInteropConnection", {});
