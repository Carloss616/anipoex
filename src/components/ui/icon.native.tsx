import { Icon as IconBase, type IconProps } from "@expo/ui";
import { withUniwind } from "uniwind";
import { Host, useIsInsideHost } from "./host";

export type { IconName, IconProps, IconSelectSpec } from "@expo/ui";

/**
 * `@expo/ui`'s Icon, self-hosting so it also works inside a plain React Native
 * tree. Inside an existing Host it renders bare — a nested Host would break the
 * Compose/SwiftUI composition boundary.
 */
function IconRootBase(props: IconProps) {
  const isInsideHost = useIsInsideHost();
  const icon = <IconBase {...props} />;

  return isInsideHost ? icon : <Host matchContents>{icon}</Host>;
}

const IconRoot = withUniwind(IconRootBase, {
  style: {
    fromClassName: "className",
  },
  color: {
    fromClassName: "className",
    styleProperty: "color",
  },
});

export const Icon = Object.assign(IconRoot, {
  select: IconBase.select,
});
