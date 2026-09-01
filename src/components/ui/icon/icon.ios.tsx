import { Icon as IconBase, type IconProps } from "@expo/ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { withUniwind } from "uniwind";
import { EnsureHost } from "../host";
import type { IconExtendProps } from "./icon";

function IconRootBase({
  muted,
  color,
  modifiers,
  ...props
}: IconProps & IconExtendProps) {
  const tint =
    color === "inherit" ? null : muted ? "secondary" : color ? null : "primary";

  return (
    <EnsureHost matchContents>
      <IconBase
        modifiers={[
          ...(tint ? [foregroundStyle(tint)] : []),
          ...(modifiers ?? []),
        ]}
        color={muted || color === "inherit" ? undefined : color}
        {...props}
      />
    </EnsureHost>
  );
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
