import { Icon as IconBase, type IconProps } from "@expo/ui";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import type { IconExtendProps } from "./icon";

function IconRoot({ muted, color, ...props }: IconProps & IconExtendProps) {
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

export const Icon = Object.assign(IconRoot, {
  select: IconBase.select,
});
