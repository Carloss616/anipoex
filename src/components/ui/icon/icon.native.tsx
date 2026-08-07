import { Icon as IconBase, type IconProps } from "@expo/ui";
import { withUniwind } from "uniwind";
import { EnsureHost } from "../host";

export type { IconName, IconProps, IconSelectSpec } from "@expo/ui";

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
