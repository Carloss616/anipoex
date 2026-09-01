import { ScrollView as ScrollViewBase } from "@expo/ui";
import { fixedSize } from "@expo/ui/swift-ui/modifiers";
import { withUniwind } from "uniwind";
import type { ScrollViewProps } from "./scroll-view";

const ScrollViewRoot = withUniwind(ScrollViewBase);

/**
 * SwiftUI's ScrollView is greedy: inside a fit-to-contents sheet it eats the
 * whole offered height, so the sheet stops tracking its content. `fixedSize`
 * makes it hug the content instead; `fill` is the case that wants the greed.
 */
export function ScrollView({ fill, modifiers, ...props }: ScrollViewProps) {
  return (
    <ScrollViewRoot
      modifiers={[
        ...(fill ? [] : [fixedSize({ vertical: true })]),
        ...(modifiers ?? []),
      ]}
      {...props}
    />
  );
}
