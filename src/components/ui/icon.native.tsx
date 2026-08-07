import { Icon as IconBase, type IconProps } from "@expo/ui";
import { withUniwind } from "uniwind";
import { EnsureHost } from "./host";

export type { IconName, IconProps, IconSelectSpec } from "@expo/ui";

/**
 * `@expo/ui`'s Icon, self-hosting so it also works inside a plain React Native
 * tree. Inside an existing Host it renders bare — a nested Host would break the
 * Compose/SwiftUI composition boundary.
 */
function IconRootBase(props: IconProps) {
  return (
    <EnsureHost matchContents>
      <IconBase {...props} />
    </EnsureHost>
  );
}

const IconRoot = withUniwind(IconRootBase);

export const Icon = Object.assign(IconRoot, {
  select: IconBase.select,
});
