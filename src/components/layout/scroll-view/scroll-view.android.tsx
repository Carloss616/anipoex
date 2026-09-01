import { ScrollView as ScrollViewBase } from "@expo/ui";
import { weight } from "@expo/ui/jetpack-compose/modifiers";
import { withUniwind } from "uniwind";
import type { ScrollViewProps } from "./scroll-view";

const ScrollViewRoot = withUniwind(ScrollViewBase);

/**
 * Compose sizes a scrollable Column to its content, so a sheet's footer gets
 * pushed off the screen. `weight(1)` hands it the leftover space instead; it
 * is a no-op outside a Row/Column scope.
 */
export function ScrollView({ fill, modifiers, ...props }: ScrollViewProps) {
  return (
    <ScrollViewRoot
      modifiers={[...(fill ? [weight(1)] : []), ...(modifiers ?? [])]}
      {...props}
    />
  );
}
