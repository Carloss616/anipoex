import { Icon as IconBase, type IconProps } from "@expo/ui";
import { withUniwind } from "uniwind";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import type { IconExtendProps } from "./icon";

function IconRootBase({ muted, color, ...props }: IconProps & IconExtendProps) {
  const m3 = useThemeM3Colors();
  return (
    <EnsureHost matchContents>
      <IconBase
        color={
          color === "inherit"
            ? undefined
            : muted
              ? m3.onSurfaceVariant
              : (color ?? m3.onSurface)
        }
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
